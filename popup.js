//When popup shows, first check if the necessary web page is open
chrome.tabs
    .query({ url: "https://*.discovercamping.ca/BCCWeb/Facilities/TrailRiverCampingSearchView.aspx*" })
    .then(([tab]) => {
        //first, hide all elements to ease up the process
        document.getElementById("extention_pageNotOpen").style.display = "none"
        document.getElementById("extention_userNotLogged").style.display = "none"
        document.getElementById("extention_noPlaceSelected").style.display = "none"
        document.getElementById("extention_pageOpen").style.display = "none"
        document.getElementById("extention_notFound").style.display = "none"
        document.getElementById("extention_timerDiv").style.display = "none"

        if (tab) {
            //if page is open check if user is logged
            //this is done by checking "custName" div - if user is logged, system greets them
            chrome.storage.sync.set({ tabId: tab.id, finishUpdates: false })
            chrome.scripting.executeScript(
                {
                    target: { tabId: tab.id },
                    function: () => { return document.getElementById("CustName") }
                },
                custName => {
                    if (!custName[0]?.result) {
                    //if user is not logged, show notification
                    document.getElementById("extention_userNotLogged").style.display="block"
                    } else {
                        //if user is logged, check selection of place and dates
                        //this is done by checking the presence of red/green boxes with ids like "div_00"
                        chrome.scripting.executeScript(
                            {
                                target: { tabId: tab.id },
                                function: () => { return document.getElementById("div_00") }
                            },
                            firstDate => {
                                if (!firstDate[0]?.result) {
                                    //if no dates, show notification to user
                                    document.getElementById("extention_noPlaceSelected").style.display="block"
                                } else {
                                    //if all checks are good, show controls to start booking
                                    document.getElementById("extention_pageOpen").style.display = "block"

                                    //also, check if we need to set additional parameters
                                    chrome.storage.sync.get(
                                        ['exec', 'time', 'found', 'div'],
                                        ({ exec, time, found, div }) => {
                                            if (exec) {
                                                document.getElementById("extention_timerDiv").style.display = "block"
                                                document.getElementById("extention_timer").innerText = time
                                            } else if (!found && time) {
                                                document.getElementById("extention_notFound").style.display = "block"
                                                chrome.storage.sync.set({ time: null })
                                            }
                                            if (div) {
                                                document.getElementById("extention_selectCamp").value = div
                                            }
                                        }
                                    )
                                    //and fill select "extention_selectCamp" with all the campgrounds 
                                    //that are listed
                                    chrome.scripting.executeScript(
                                        {
                                            target: { tabId: tab.id },
                                            function: getCampings
                                        },
                                        response => {
                                            const result = response[0].result

                                            //remove options from the previous launch
                                            const select = document.getElementById("extention_selectCamp")
                                            const x = select.options.length
                                            if (x) {
                                                for (let i = 0; i < x; i++){
                                                    select.options.remove(i)
                                                }
                                            }

                                            //add options from current listing
                                            result.forEach((item,i) => {
                                                const option = document.createElement("option");
                                                option.text = item
                                                option.value = `div_0${i}`
                                                select.add(option)
                                            })
                                        }
                                    )
                                }
                            }
                        )
                    }
                }
            );
        } else {
            //if page is not open, show notification with the next steps
            document.getElementById("extention_pageNotOpen").style.display="block"
        }
    })

//listen to stop button press (stop timer execution and hide countdown)
let stopBooking = document.getElementById("extention_stopBooking");
stopBooking.addEventListener("click", () => {
    chrome.storage.sync.set({ stop:true })
    document.getElementById("extention_timerDiv").style.display = "none"
})

// Listen to start button press
let startBooking = document.getElementById("extention_startBooking");
startBooking.addEventListener("click", async () => {
    //if nothing was found during previous attempt, hide notification
    document.getElementById("extention_notFound").style.display = "none"
    
    //get parameters from user input: camping (represented by "div") and time to try
    const div = document.getElementById("extention_selectCamp").value
    const time = Number(document.getElementById("extention_selectTime").value)
    const endTime = Number(new Date()) + time * 60 * 1000
    //set these parameters to storage
    chrome.storage.sync.set({ div, endTime, found: false, stop:false });
    chrome.runtime.sendMessage({})
    
    //display timer
    document.getElementById("extention_timerDiv").style.display = "block"
});

//this listener updates popup window when parameters in storage change
chrome.storage.onChanged.addListener(
    (changes) => {
        //if executions of the timer is finished by any reason, hide timer 
        if (changes.hasOwnProperty('exec')) {
            const { newValue } = changes.exec
            if (!newValue) {
                document.getElementById("extention_timerDiv").style.display = "none"
                chrome.storage.sync.set({ div:null });
            }
        }
        //when time changes, there are two options
        if (changes.hasOwnProperty('time')) {
            const { newValue } = changes.time

            //if new time value is present, we update countdown
            //and ensure that countdown is visible
            if (newValue) {
                document.getElementById("extention_timer").innerText = newValue
                document.getElementById("extention_timerDiv").style.display = "block"

            //if time updated to null, this means execution is finished, so hide the countdown
            } else {
                document.getElementById("extention_timerDiv").style.display = "none"
            }
        }
    }
);

//get camping names that are listed on the website
//all names are represented by the first column in each table row and have the same CSS class
function getCampings() {
    const camps = Array.from(document.getElementsByClassName("first_td_table_one"))
    return camps.map(item => item.innerText.trim())
}


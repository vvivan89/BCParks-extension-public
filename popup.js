//When popup shows, first check if the necessary web page is open
chrome.tabs
    .query({ url: "https://*.discovercamping.ca/BCCWeb/Facilities/TrailRiverCampingSearchView.aspx*" })
    .then(([tab]) => {
        //first, hide all elements to ease up the process
        const ids = [
            'extention_pageNotOpen',
            'extention_userNotLogged',
            'extention_noPlaceSelected',
            'extention_pageOpen',
            'extention_notFound',
            'extention_timerDiv'
        ]
        ids.forEach(item=>{display(item,'none')})

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
                    display("extention_userNotLogged","block")
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
                                    display("extention_noPlaceSelected","block")
                                } else {
                                    //if all checks are good, show controls to start booking
                                    display("extention_pageOpen","block")

                                    //also, check if we need to set additional parameters
                                    chrome.storage.sync.get(
                                        ['exec', 'time', 'found', 'div'],
                                        ({ exec, time, found, div }) => {
                                            if (exec) {
                                                display("extention_timerDiv","block")
                                                document.getElementById("extention_timer").innerText = time
                                            } else if (!found && time) {
                                                display("extention_notFound", "block")
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
            display("extention_pageNotOpen", "block")
        }
    })

//listen to stop button press (stop timer execution and hide countdown)
let stopBooking = document.getElementById("extention_stopBooking");
stopBooking.addEventListener("click", () => {
    chrome.storage.sync.set({ stop: true })
    display("extention_timerDiv", "none")    
})

// Listen to start button press
let startBooking = document.getElementById("extention_startBooking");
startBooking.addEventListener("click", async () => {
    //if nothing was found during previous attempt, hide notification
    display("extention_notFound", "none")  
    
    //get parameters from user input: camping (represented by "div") and time to try
    const div = document.getElementById("extention_selectCamp").value
    const time = Number(document.getElementById("extention_selectTime").value)
    const endTime = Number(new Date()) + time * 60 * 1000
    //set these parameters to storage
    chrome.storage.sync.set({ div, endTime, found: false, stop:false });
    chrome.runtime.sendMessage({})
    
    //display timer
    display("extention_timerDiv", "block")  
});

//this listener updates popup window when parameters in storage change
chrome.storage.onChanged.addListener(
    (changes) => {
        //if executions of the timer is finished by any reason, hide timer 
        if (changes.hasOwnProperty('exec')) {
            const { newValue } = changes.exec
            if (!newValue) {
                display("extention_timerDiv", "none")  
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
                display("extention_timerDiv", "block")  

            //if time updated to null, this means execution is finished, so hide the countdown
            } else {
                display("extention_timerDiv", "none")  
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
const display = (id,mode)=> document.getElementById(id).style.display = mode


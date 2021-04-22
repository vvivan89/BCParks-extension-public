// Waits for message: either from extention popup window (button "start" or from "search.js")
chrome.runtime.onMessage.addListener(() => {

	//first, get storage parameters
	chrome.storage.sync.get(
		['endTime', 'tabId','stop'],
		({ endTime, tabId, stop }) => {
			//if stop signal is sent or it's time to end execution, do nothing
			if (!stop && endTime > Number(new Date())) {

				//do new search iteration
				chrome.scripting.executeScript({
					target: { tabId },
					files:['search.js'],
				})

				//get remaining time of execution
				const time = getTimeLeft(endTime)

				//set parameters to invoke additional actions in popup window
				chrome.storage.sync.set({ time, exec: true })
			}
		}
	)
});

//Second listener checks if the tab address changed: this actually means that booking is done
chrome.tabs.onUpdated.addListener(
	(newTabId, changeInfo, tab) => {
		//only fire when tab is fully loaded
		if (changeInfo.status === 'complete') {
			//first, get tab ID and variable for timer from storage
			chrome.storage.sync.get(
				['tabId','exec'],
				async ({ tabId, exec }) => {
					//check is the tab is updated to a correct address
					if (newTabId === tabId && exec &&
						tab.url.includes("discovercamping.ca/BCCWeb/Facilities/TrailRiverCampingReservationPreCart.aspx")) {

						//save some parameters to update popup window
						chrome.storage.sync.set({ found: true, exec: false, time: null,stop:true  })
					
						//get current tab
						let [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

						//if current tab is not BC parks, show alert
						if (activeTab && activeTab.id !== tabId) {
							setTimeout(() => {
								chrome.scripting.executeScript({
									target: { tabId: activeTab.id },
									function: () => alert("BC Parks camping availability found.\n\nPlease proceed with booking immediately"),
								})

							}, 500)
						}
					}
				}
			)
		}
	}
);

//function calculates time remaining before timer stops executing
//and returns string in minutes and seconds
function getTimeLeft(endTime) {
  //difference between timer ending time and now in seconds
  const secondsDiff = Math.round((endTime - Number(new Date)) / 1000)
  
  //minutes are calculated as a integer part of seconds difference divided by 60
  const minutes = Math.floor(secondsDiff / 60)

  //seconds are a remainder of the above
  const seconds = secondsDiff - minutes * 60

  //add plurals from to minutes and seconds if they do not end with 1 (zero goes with plural form as well)
  const minPlural = minutes.toString().endsWith('1') ? "" : "s"
  const secPlural = seconds.toString().endsWith('1') ? "" : "s"

  //return string
  return `${minutes} minute${minPlural} and ${seconds} second${secPlural}`
}
//searches and books campground
chrome.storage.sync.get(
      	['div'],
		({ div }) => {
		//get what is written on the desired campground and date
			const availNode = document.getElementById(div).innerText
			
			//calculate availability based on selected party size
			const padsAvailable = availNode === 'Not Available'
				? 0
				: Number(availNode.substr(9).trim()) //remove "Book now\n"
			
			//party size is here
			const padsNeeded = Number(document.getElementById("mainContent_homeContent_ddlNights").value)
			console.log(new Date().getSeconds(), new Date().getMilliseconds())
			//if available, proceed with booking
			if (padsAvailable >= padsNeeded) {
			
				//select the campground
				const reservation = document.getElementById(div)

				//check if it is already selected (then we do not need to click again)
				//when clicked, background changes to rgb(77, 77, 77)
				const bg = reservation.children[0].style.background
				if(bg!=='rgb(77, 77, 77)'){reservation.click()}

				//find DOM node where "submit" button is located
				const button = document.getElementsByClassName('reserve_blue_btn_right')[0]

				//click on "submit" button
				button.children[0].click()
			}
			/*
				always click on search button again if the page did not start reloading
				but first, we want timer to execute exactly at xx.010 (10 milliseconds)
				so we need to calculate the delay
				this behavior is important to catch the sites directly when the booking date becomes available 
				// (currently it's 7:00:00.000 PST/PDT)
			*/
			const ms = new Date().getMilliseconds()
			const delay = 1010-ms
			setTimeout(() => {
                document.getElementById('btnSearch').click()
                //also send new message to the background to set new timeout
				chrome.runtime.sendMessage({})
			}, delay)
        }
    )
# BC Parks automation extension for Google Chrome
This Chrome Extension is for users of British Columbia (Canada) provincial parks reservation system. 
It automatically checks availability of backcountry campsites in British Columbia and tries to book a place. 

# Why?
If you live in British Columbia and love camping, you will feel my pain. The best backcountry campsites are gone in seconds after they are released. 
Your chances to get a camping spot in [Garibaldi](https://www.google.com/search?q=Garibaldi+Provincial+Park&safe=active&rlz=1C1CHBF_enCA907CA907&sxsrf=ALeKk005JyHpYaVIDzE2wOiE1K51OjMdRQ:1619652205066&source=lnms&tbm=isch&sa=X&ved=2ahUKEwiUoN7SiqLwAhUyOn0KHcUJBDcQ_AUoAnoECAEQBA&biw=1920&bih=937) 
during summer weekends are almost zero. This is my solution to beat the crowd, and it works.

# How to use
* First, navigate to [discovercamping.ca](https://www.discovercamping.ca/BCCWeb/Facilities/TrailRiverCampingSearchView.aspx)
* Sign in to the system with your login and password
* Select the park and enter number of tent pads you need and your party size
* Click search button
* Now open the extension:
  * Select the particular campground, if there are several options
  * Select the time that the extension will try to book a site 
  * Press start

![Screenshot](https://lh3.googleusercontent.com/9l3MjSd_H43GH-OkqzYmy_SjDt2o7ilwONWHk_ytCTRDBBjG3GoHsr8bFGppSJzoWazHgtfliUaSJ7V3X0zSlQ-L=w640-h400-e365-rj-sc0x00ffffff)
  
# The process
Extension runs in the background and presses "Search" button every second in an attempt to catch released places. 
The user can then use other browser tabs, but the tab with the search need to be open. 
Is staying on the page, the user can either see nothing or see the popup window with error message - this does not interrupt the extension work.
As soon as a place is found, it is placed to the shopping cart and user gets alert notification to the active tab. 
The place will stay in cart for 15 minutes, then it will be released.

### [Get it here](https://chrome.google.com/webstore/detail/bc-parks-automated-backco/aphejndjiaepbeehnecjoehebpnhibkh?hl=en&authuser=0)

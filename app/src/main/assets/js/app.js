// action words and colors for the active footer content
    const actionWords = ['Climb', 'Crawl', 'Drift', 'Trail', 'Race', 'Challenge', 'Expedition', 'Scramble', 'Slide', 'Path', 'Dash', 'Encounter', 'Adventure'];
    const colors = ['#FF4500', '#228B22', '#1E90FF', '#FFD700', '#FF6347', '#00CED1', '#FF8C00', '#8A2BE2', '#6495ED', '#32CDFF', '#FF6347', '#FF00FF', '#c92bc7'];

    let index = 0;

    function rotateWords() {
        const actionWordElement = document.getElementById('actionWord');
        actionWordElement.innerText = actionWords[index];
        actionWordElement.style.color = colors[index];  // Change color as the word cycles
        index = (index + 1) % actionWords.length;
    }

    setInterval(rotateWords, 1000);  // Rotate every 2 seconds

// Initialize all popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl, {
            trigger: 'click'
        });
    });

    // Close all popovers before opening a new one
    popoverTriggerList.forEach(function (popoverTriggerEl, index) {
        popoverTriggerEl.addEventListener('click', function () {
            popoverList.forEach(function (popover, i) {
                if (i !== index) {
                    popover.hide(); // Hide all other popovers
                }
            });
        });
    });


// provides esp32 details - needs to be dynamic
    function updateHostDetails(){
        const esp32hostname = 'ESP112943';    
        const esp32hostid = '10:11:14:ab:p2';    
        
        document.getElementById("esp32hostname").innerHTML = esp32hostname;
        document.getElementById("esp32hostid").innerHTML = esp32hostid;
    }

//  when page loads, run these 
    document.addEventListener("DOMContentLoaded", function() { 

    const year = new Date().getFullYear();  
    const footerHTML = `
        <div class="appFooter">
            <div>DynamicDrive</div>
            <p><em>Bringing Realism to Every <span id="actionWord" style="font-weight:bold; text-decoration: none ;">Movement</span>.</em></p>
            <div class="footer-title">
                Copyright &copy; DynamicDrive ` + year + `.<br/>All Rights Reserved.
            </div>
        </div>
      `;
    document.getElementById('footer-container').innerHTML = footerHTML;
  

    const appHeaderHTML = `
        <div class="appHeader bg-primary">
            <div class="left">
                <a href="#" class="headerButton" data-bs-toggle="offcanvas" data-bs-target="#sidebarPanel">
                    <ion-icon name="menu-outline" role="img" class="md hydrated" aria-label="menu outline"></ion-icon>
                </a>
            </div>
            <div class="pageTitle right">
                Dynamic Drive
            </div>
            <!-- <div class="right">
                <a href="#" class="headerButton toggle-searchbox">
                    <ion-icon name="search-outline" role="img" class="md hydrated" aria-label="search outline"></ion-icon>
                </a>
            </div> -->
        </div>
      `;
    document.getElementById('app-header-container').innerHTML = appHeaderHTML;

    const appNotificationHTML = `
    <div id="notification-welcome" class="notification-box">
        <div class="notification-dialog android-style">
            <div class="notification-header">
                <div class="in">
                    <img src="images/dynamic_drive_logo.jpg" alt="image" class="imaged w24">
                    <strong>DynamicDrive</strong>
                    <span>just now</span>
                </div>
                <a href="#" class="close-button">
                    <ion-icon name="close" role="img" class="md hydrated" aria-label="close"></ion-icon>
                </a>
            </div>
            <div class="notification-content">
                <div class="in">
                    <h3 class="subtitle">Welcome to DynamicDrive</h3>
                    <div class="text">
                        Bringing Realism to Every Motion.
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    document.getElementById('app-notification-container').innerHTML = appNotificationHTML;

    const appSidebarHTML = `
    <div class="offcanvas offcanvas-start" tabindex="-1" id="sidebarPanel">
        <div class="offcanvas-body">
            <!-- profile box -->
            <div class="profileBox">
                <!-- <div class="image-wrapper">
                    <img src="images/avatar1.jpg" alt="image" class="imaged rounded">
                </div> -->
                <div class="in">
                    <strong><span id="esp32hostname"></span></strong>
                    <div class="text-muted">
                        <!-- <ion-icon name="location" role="img" class="md hydrated" aria-label="location"></ion-icon> -->
                        <span id="esp32hostid">
                    </div>
                </div>
                <a href="#" class="close-sidebar-button" data-bs-dismiss="offcanvas">
                    <ion-icon name="close" role="img" class="md hydrated" aria-label="close"></ion-icon>
                </a>
            </div>
            <!-- * profile box -->

            <!-- offcanvas -->
            <ul class="listview flush transparent no-line image-listview mt-2">
                <li>
                    <a href="index.html" class="item">
                        <div class="icon-box bg-primary">
                            <i class="fa-solid fa-house"></i>
                        </div>
                        <div class="in">
                            Home
                        </div>
                    </a>
                </li>
                <li>
                    <a href="suspension.html" class="item">
                        <div class="icon-box bg-primary">
                            <i class="fa-solid fa-truck-monster"></i>
                        </div>
                        <div class="in">
                            Suspension
                        </div>
                    </a>
                </li>
                <li>
                    <a href="lights.html" class="item">
                        <div class="icon-box bg-primary">
                            <i class="fa-solid fa-lightbulb"></i>
                        </div>
                        <div class="in">
                            <div>Lights</div>
                        </div>
                    </a>
                </li>
                <li>
                    <a href="settings.html" class="item">
                        <div class="icon-box bg-primary">
                            <i class="fa-solid fa-gear"></i>
                        </div>
                        <div class="in">
                            <div>Setup</div>
                            <!-- <span class="badge badge-danger">5</span> -->
                        </div>
                    </a>
                </li>
                <!-- <li>
                    <a href="whats-new.html" class="item">
                        <div class="icon-box bg-primary">
                            <i class="fa-solid fa-pizza-slice"></i>
                        </div>
                        <div class="in">
                            <div>What's New</div> -->
                            <!-- <span class="badge badge-danger">5</span> --> <!-- 
                        </div>
                    </a>
                </li> -->
                <!-- <li>
                    <div class="item">
                        <div class="icon-box bg-primary">
                            <ion-icon name="moon-outline" role="img" class="md hydrated" aria-label="moon outline"></ion-icon>
                        </div>
                        <div class="in">
                            <div>Dark Mode</div>
                            <div class="form-check form-switch">
                                <input class="form-check-input dark-mode-switch" type="checkbox" id="darkmodesidebar">
                                <label class="form-check-label" for="darkmodesidebar"></label>
                            </div>
                        </div>
                    </div>
                </li> -->
            </ul>
            <!-- off canvas -->
        </div>
        <!-- sidebar buttons -->
        <!-- <div class="sidebar-buttons">
            <a href="#" class="button">
                <ion-icon name="person-outline" role="img" class="md hydrated" aria-label="person outline"></ion-icon>
            </a>
            <a href="#" class="button">
                <ion-icon name="archive-outline" role="img" class="md hydrated" aria-label="archive outline"></ion-icon>
            </a>
            <a href="#" class="button">
                <ion-icon name="settings-outline" role="img" class="md hydrated" aria-label="settings outline"></ion-icon>
            </a>
            <a href="#" class="button">
                <ion-icon name="log-out-outline" role="img" class="md hydrated" aria-label="log out outline"></ion-icon>
            </a>
        </div> -->
        <!-- * sidebar buttons -->
    </div>
    `;
    document.getElementById('app-sidebar-container').innerHTML = appSidebarHTML;

    const appBottomHTML = `
        <div class="appBottomMenu bg-primary text-light">
            <a href="index.html" class="item">
                <div class="col">
                    <i class="fa-solid fa-house"></i>
                    <!-- <strong>Dashboard</strong> -->
                </div>
            </a>
            <a href="suspension.html" class="item">
                <div class="col">
                    <i class="fa-solid fa-truck-monster"></i>
                    <!-- <strong>Suspension</strong> -->
                </div>
            </a>
            <a href="lights.html" class="item">
                <div class="col">
                    <i class="fa-solid fa-lightbulb"></i>
                    <!-- <span class="badge badge-danger">5</span> -->
                </div>
            </a>
            <a href="settings.html" class="item">
                <div class="col">
                    <i class="fa-solid fa-gear"></i>
                    <!-- <strong>Setup</strong> -->
                </div>
            </a>
                
        </div>
        `;
    document.getElementById('app-bottom-container').innerHTML = appBottomHTML;

  // Get the height of the 'app-bottom-container' - should be dynamic but for now is static
    var bottomContainerHeight = 52;
    // Set the padding-bottom of the 'footer-container' to match the height
    var footerContainer = document.getElementById('footer-container');
    footerContainer.style.paddingBottom = bottomContainerHeight + 'px';

//  marks the appropriate button on the bottom menu bar as active
    // Get the current page's filename
    var path = window.location.pathname;
    var page = path.split("/").pop();

    // Get all anchor links in the bottom menu
    var menuItems = document.querySelectorAll('.appBottomMenu .item');

    // Loop through each menu item
    menuItems.forEach(function(item) {
        // Get the href attribute of each link
        var href = item.getAttribute('href');

        // Check if the href matches the current page
        if (href === page) {
            // Add the 'active' class to the matching link
            item.classList.add('active');
        }
    });
});

function resetPhysicalGyro() {
    console.log('resetGyro clicked');
    const key = "mpureset";
    const value = 1;
    console.log("Reset Gyro button clicked");
    const data = JSON.stringify({ [key]: value });
    BluetoothInterface.sendData(data);
}

function init(){
    updateHostDetails();
}

window.onload = function(event) {
    init();
};



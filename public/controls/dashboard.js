class Dashboard {

    constructor(player) {
        this._player = player;
        this.isShown = false;
        this.render();
        this.bindEvents();
    }

    render() {
        document.querySelector('#dashboardModalContainer').innerHTML += `
            <div class="hero-body">
                <div id="dashboardCloseBtn" class="dialog-close-btn link-btn">
                    <span class="icon">
                        <i class="fa fa-times" aria-hidden="true"></i>
                    </span>
                </div>
                <div id="tabs" class="content">
                    <div class="tab-container tabs-center">
                        <ul>
                            <li class="tab-item selected">
                                <a>Settings</a>
                            </li>
                            <li class="tab-item">
                                <a>Queue</a>
                            </li>
                        </ul>
                    </div>
                    <div class="tabpage shown">
                        <div class="content">
                            <h3>Settings</h3>
                            <div class="divider"></div>
                            <space></space>
                            <div class="row">
                                <div class="toggle-container">
                                    <p>Enable battery saver</p>
                                    <div class="toggle-switch"><input type="checkbox" id="chkBattery"/><label for="chkBattery"></label></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="tabpage">
                        <div class="content">
                            <h3>Queue</h3>
                            <div class="divider"></div>
                            <space></space>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        this.dashboardCloseBtn = document.getElementById('dashboardCloseBtn');

        // Event handler for close button for search dialog
        this.dashboardCloseBtn.onclick = (e) => {
            this.hideDashboard();
        }
    }

    toggleDashboard() {
        // Scroll to top to show the search dialog
        window.scrollTo(0, 0);

        this.isShown = !this.isShown;
        if (this.isShown) {
            $('#dashboardModalContainer').addClass('shown');
            if ($(window).width() <= 768)
                $('body').css({'overflow-y': 'hidden'});
        } else {
            // Reset dialog (must place up here to account for invalid input)
            $('#dashboardModalContainer').removeClass('shown'); // Hide the search modal
            if ($(window).width() <= 768) // For mobile UI
                $('body').css({'overflow-y': 'scroll'});
        }
    }


    hideDashboard() {
        // Reset dialog (must place up here to account for invalid input)
        $('#dashboardModalContainer').removeClass('shown'); // Hide the search modal
        if ($(window).width() <= 768) // For mobile UI
            $('body').css({'overflow-y': 'scroll'});
        this.isShown = false;
    }
}

export default Dashboard;
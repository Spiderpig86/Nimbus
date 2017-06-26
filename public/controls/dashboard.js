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
                <div id="dashboardCloseBtn" class="link-btn">
                    <span class="icon">
                        <i class="fa fa-times" aria-hidden="true"></i>
                    </span>
                </div>
                <div class="content">
                    <div class="tab-container">
                        <ul class="tabs-center">
                            <li class="selected">
                                <a>Settings</a>
                            </li>
                            <li>
                                <a>Queue</a>
                            </li>
                        </ul>
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
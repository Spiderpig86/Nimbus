import Nimbus from '../public/js/player'; // Import the actual player component

describe('Nimbus', () => {
    // Create initial page
    document.body.innerHTML = 
    `
        <div class='app'>
            <div id="background" class="bg-image"></div>

            <!-- Search Modal -->
            <div class="hero fullscreen overlay-dialog" id="searchModalContainer">

            </div>

            <!-- Actions/Settings -->
            <div class="hero fullscreen overlay-dialog" id="dashboardModalContainer">

            </div>

            <!-- Chart Modal -->
            <div class="hero fullscreen overlay-dialog" id="chartModalContainer">

            </div>

            <section class="hero fullscreen" id="playerHero">
                <!--top-->
                <div class="header header-fixed unselectable level">
                    <div class="header-left">
                        <div class="header-item" id="seek-bk-btn"><i class="fa fa-step-backward" aria-hidden="true"></i></div>
                        <div class="header-item" id="play-btn"><i class="fa fa-pause" aria-hidden="true"></i></div>
                        <div class="header-item" id="seek-fw-btn"><i class="fa fa-step-forward" aria-hidden="true"></i></div>
                        <div class="header-item" id="repeat-btn" data-badge="1"><i class="fa fa-repeat" aria-hidden="true"></i></div>
                    </div>
                    <div class="header-center">
                        <!-- Logo -->
                        <a href="#"><h6 class="lowercase">Nimbus</h6></a>
                    </div>
                    <div class="header-right">
                        <div class="header-item">
                            <a class="header-item" id="dashboard-btn"><i class="fa fa-sliders" aria-hidden="true"></i></a>
                        </div>
                        <div class="header-item">
                            <a class="header-item" id="custom-btn"><i class="fa fa-search" aria-hidden="true"></i></a>
                        </div>
                    </div>
                </div>

                <div class="hero-body no-padding">
                    <!-- Place history on right side -->
                    <div class="row no-padding no-margin" id="playerInfoContainer">
                        <div class="col-8" id="mainPlayer">
                            <div id="songContainer">

                            </div>
                            <iframe id="widgettest">

                            </iframe>
                        </div>
                        <div class="col-4 no-padding" id="histContainer">
                            <div class="">
                                <div class="content">
                                    <h6 class="text-center uppercase">History</h6>
                                </div>
                            </div>
                            
                        </div>
                    </div>

                    <div id="toastContainer" class="center">

                    </div>
                </div>
        </div>
    `;

    const track = {
        title: 'test',
        id: '123',
        user: {
            username: 'test123',
            permalink_url: 'bing.com',
            purchase_url: 'purchaselink.com'
        },
        likes_count: 100,
        permalink_url: 'google.com',
        comment_count: 124,
        reposts_count: 1223,
        created_at: '2014/08/01 17:19:50 +0000',
        genre: 'Electro'
    }

    const N = new Nimbus(); // Create new Nimbus instance

    it('starting player', () => {
        expect(N.start()).toBeTruthy();
    });

    it('loads information onto UI', () => {
        N.updateSongInfo(track);
        expect(N.mainPlayer.innerHTML).toBeTruthy();
    }
});
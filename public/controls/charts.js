import ChartItem from './chartitem';

class Charts {

    constructor(player) {
        this._player = player;
        this.isShown = false;
        this.render();
        this.bindEvents();

        // Load the charts
        let c = null;
        this.chartContainer = document.querySelector('#allCharts');
        $.ajax({
            url: 'http://polarity.x10.mx/nimbus/charts.json',
            type: "GET",
            dataType:'json', 
            success: (data) => {
                for (let i = 0; i < data.collection.length; i++) {
                    c = new ChartItem(this._player, data.collection[i].chart.title, data.collection[i].chart.author, data.collection[i].chart.kind, data.collection[i].chart.genre_url, data.collection[i].chart.limit, data.collection[i].chart.image_url);
                    this.chartContainer.appendChild(c.render());
                }
            }
        });
    }

    render() {
        document.querySelector('#chartModalContainer').innerHTML += `
            <div class="hero-body">
                <div id="chartsCloseButton" class="dialog-close-btn link-btn">
                    <span class="icon">
                        <i class="fa fa-times" aria-hidden="true"></i>
                    </span>
                </div>
                <div class="content">
                    <div class="row">
                        <h3 class="white">Charts</h3>
                        <div class="row" id="allCharts">

                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        this.chartsCloseButton = document.getElementById('chartsCloseButton');

        // Event handler for close button for search dialog
        this.chartsCloseButton.onclick = (e) => {
            this.hideCharts();
        }
    }

    toggleCharts() {
        // Scroll to top to show the search dialog
        window.scrollTo(0, 0);

        this.isShown = !this.isShown;
        if (this.isShown) {
            $('#chartModalContainer').addClass('shown');
            if ($(window).width() <= 768)
                $('body').css({'overflow-y': 'hidden'});
            //if (window.innerWidth > 768) {
                $('#playerHero').addClass('unfocused');
            //}
        } else {
            // Reset dialog (must place up here to account for invalid input)
            $('#chartModalContainer').removeClass('shown'); // Hide the search modal
            if ($(window).width() <= 768) // For mobile UI
                $('body').css({'overflow-y': 'scroll'});

            //if (window.innerWidth > 768) {
                $('#playerHero').removeClass('unfocused');
            //}
        }
    }


    hideCharts() {
        // Reset dialog (must place up here to account for invalid input)
        $('#chartModalContainer').removeClass('shown'); // Hide the search modal
        if ($(window).width() <= 768) // For mobile UI
            $('body').css({'overflow-y': 'scroll'});
        this.isShown = false;
        //if (window.innerWidth > 768) {
            $('#playerHero').removeClass('unfocused');
        //}
    }

}

export default Charts
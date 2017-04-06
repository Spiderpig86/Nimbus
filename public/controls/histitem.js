"use strict"

const histItem = (imgurl, title, artist) => {
    // Using string literals
    `
        <div class="card">
            <div class="content">
                <div class="row">
                    <div class="col-3">
                        <img src=""/>
                    </div>
                    <div class="col-9">
                        <p class="title">${title}</p>
                        <p class="subtitle">${artist}>/p>
                    </div>
                </div>
            </div>
        </div>
    `
};

export default histItem
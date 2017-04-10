# Nimbus
A simple web application powered by Express and NodeJS that fetches random songs from the SoundCloud library using the SoundCloud API.

# Dependencies
Nimbus uses a few packages to help this run on a machine. Some of the dependencies includes:
* [Express](https://expressjs.com/) - it is a web application after all.
* [Babel](https://babeljs.io/) - mainly to support older browsers if you need it.
* [Webpack](https://webpack.github.io/) - bundles modules together to make imports work.
* [Cirrus](https://github.com/Spiderpig86/Cirrus) - a CSS framework I developed.

# How to Run
First obtain all the dependencies:
```
npm install
```
Then set up your API key, which is located in `consts.json`.
After you make sure that all the dependencies are included, run:
```
node ./routes/appjs
```
If you have made any changes to the modules, make sure to run:
```
webpack
```

# Challenges
## Learning
Perhaps the most difficult aspect of this challenge was to learn how to do something completely foreign in a short span of a few days. This is not my first time dealing with a situation like this, but as difficult as this can get, I have enjoyed every moment writing this application. I have dabbled with web applications before, but none compare to the structural complexity and modularity of Nimbus. This was a great breather project for me to take my mind off of Assembly and midterms.
## Recursively Searching for Songs
Although it may sound very simple, it was something that was not apparent at first glance. In all my earlier attempts, I have overlooked the asynchronous nature of the SoundCloud API and the idea of Promises were new to me. So instead of handling a request that fetched no songs with a randomly generated id, I simply used a promise obtained from the request and added a handler for requests with errors. From there, I could simply make a recursive call to fetch a new track.
```javascript
    SC.get('/tracks/' + id).then((track) => {
        // Function body
    }, (err) => {
        // If there is no song with the associated ID, fetch a new one.
        this.updateStream(this.getRandomTrack());
    });
```

# Testing
Unfortunately I was unable to learn and implement unit tests on time. I did look into some potential frameworks like MochaJS.

# Future

# Conclusion
Overall Nimbus was quite an ambitious project for me given all the steps I needed to take before being able to start working on the actual functionality itself in the span of a few days. This was a great challenge since I have learned a lot more than I had expected in ES6 standards, npm packages, modularity in JS, and working with APIs. The idea of making a SoundCloud Randomizer was to have something that would really build and play a list of tracks that I would not have searched for myself. Given that SoundCloud is a platform where a lot of budding artists show off their creation, I thought it was appropriate to design something that would reflect the freshness that the platform had. A track that a person had never listened to before that was published a decade ago is still a new song to them.
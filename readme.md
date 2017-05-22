<p align="center"><a href="https://nimbusmusic.herokuapp.com/" target="_blank"><img width="150" src="https://github.com/Spiderpig86/Nimbus/blob/master/nimbus.png"></a></p>
<h1 align="center">Nimbus</h1>
<p align="center">A simple web application powered by Express and NodeJS that fetches random songs from the SoundCloud library using the SoundCloud API.</p>

## Keyboard Shortcuts
| Command       | Keyboard Combo|
| ------------- |:-------------:|
| Play/Pause    | Space         |
| Arrow-Right   | Find New Song |
| Volume Up     | Shift + Arrow-Up |
| Volume Down   | Shift + Arrow-Down |

## Dependencies
Nimbus uses a few packages to help this run on a machine. Some of the dependencies includes:
* [Express](https://expressjs.com/) - it is a web application after all.
* [Babel](https://babeljs.io/) - mainly to support older browsers if you need it.
* [Webpack](https://webpack.github.io/) - bundles modules together to make imports work.
* [Cirrus](https://github.com/Spiderpig86/Cirrus) - a CSS framework I developed.

## Screenshots
![As of 5/19/17](http://i.imgur.com/SvuNuNA.png "Nimbus")
<p align="center">Nimbus as of 5/19/17</p>

![Early Stages](http://i.imgur.com/V95oIeC.png "Nimbus Player")

## How to Run
First obtain all the dependencies:
```
npm install
```
Then set up your API key, which is located in `consts.json`.
After you make sure that all the dependencies are included, run:
```
node ./routes/app.js
```
If you have made any changes to the modules, make sure to run:
```
webpack
```
and then rerun:
```
node ./routes/app.js
```
To stop the app from running, execute:
```
process.exit(0);
```

## Challenges

### Learning
Perhaps the most difficult aspect of this challenge was to learn how to do something completely foreign in a short span of a few days. This is not my first time dealing with a situation like this, but as difficult as this can get, I have enjoyed every moment writing this application. I have dabbled with web applications before, but none compare to the structural complexity and modularity of Nimbus. This is the first time I have written something involving a lot of the new features of ES6 including promises, arrow functions, and template literals. It also helped me improve my thinking and organization while trying to decide how to implement an application like this. This was a great breather project for me to take my mind off of Assembly and midterms.

### Recursively Searching for Songs
Although it may sound very simple, it was something that was not apparent at first glance. In all my earlier attempts, I have overlooked the asynchronous nature of the SoundCloud API and the idea of Promises were new to me. So instead of handling a request that fetched no songs with a randomly generated id, I simply used a promise obtained from the request and added a handler for requests with errors. From there, I could simply make a recursive call to fetch a new track.
```javascript
    SC.get('/tracks/' + id).then((track) => {
        // Function body
    }, (err) => {
        // If there is no song with the associated ID, fetch a new one.
        this.updateStream(this.getRandomTrack());
    });
```

## Testing
Unfortunately I was unable to learn and implement unit tests on time. I did look into some potential frameworks like MochaJS. Regarding testing, even if I choose not to use a framework, I can try to load the app and then trigger certain commands to see if the actions are performed or if it runs into an exception. In the near future, one of the things I would like to do with Nimbus is to be able to test the app through scripts.

## Future
### Playing and Saving Previous Tracks
Currently there is a structure in place to store the past tracks that the user has played but there is no actual way to be able to play previous tracks with a rewind button. When the user moves to the previous track, there would be a way to pop from the history queue and play the track stored in the object.

### Syncing with SoundCloud
Another feature that can be implemented is to sync with the user's account to be able to save information and preferences such as past tracks so they can be added to their playlists. Users would be able to login to their accounts with an OAuth2 request through a login page in the menu.

### Selecting Specific Types of Tracks
Although this is for finding random tracks in SoundCloud, sometimes users would like to specialize what they want to listen to down the genres, artists, songs, podcasts, and other content from SoundCloud. 

## Conclusion
Overall Nimbus was quite an ambitious project for me given all the steps I needed to take before being able to start working on the actual functionality itself in the span of a few days. This was a great challenge since I have learned a lot more than I had expected in ES6 standards, npm packages, modularity in JS, and working with APIs. The idea of making a SoundCloud Randomizer was to have something that would really build and play a list of tracks that I would not have searched for myself. Given that SoundCloud is a platform where a lot of budding artists show off their creation, I thought it was appropriate to design something that would reflect the freshness that the platform had. A track that a person had never listened to before that was published a decade ago is still a new song to them.

## TODO
* Play songs by artist/genre.
* Reduce blur overhead on mobile devices.
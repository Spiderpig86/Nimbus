<p align="center"><a href="https://nimbusmusic.herokuapp.com/" target="_blank"><img width="150" src="https://github.com/Spiderpig86/Nimbus/blob/master/nimbus.png"></a></p>
<h1 align="center">Nimbus</h1>
<p align="center">A simple web application powered by Express and NodeJS that fetches random songs from the SoundCloud library using the SoundCloud API.</p>

## Keyboard Shortcuts
| Command       | Keyboard Combo|
| ------------- |:-------------:|
| Play/Pause    | Space         |
| Rewind   | Shift + Arrow-Left |
| Seek Next   | Shift + Arrow-Right |
| Volume Up     | Shift + Arrow-Up |
| Volume Down   | Shift + Arrow-Down |

## Dependencies
Nimbus uses a few packages to help this run on a machine. Some of the dependencies includes:
* :dash: [Express](https://expressjs.com/) - it is a web application after all.
* :hammer: [Babel](https://babeljs.io/) - mainly to support older browsers if you need it.
* :gem: [Webpack](https://webpack.github.io/) - bundles modules together to make imports work.
* :cloud: [Cirrus](https://github.com/Spiderpig86/Cirrus) - a CSS framework I developed.

## Why Nimbus?
As great of a platform SoundCloud is, it is mainly built for sharing music through more of a social network rather than for streaming. Recently, SoundCloud has shifted towards streaming services by releasing SoundCloud Go as a subscription based service. this is a great move, but the overall website does not provide as in depth of a streaming experience as it should be. Songs should easily be added to the queue and new related tracks should appear in the queue that allows for user editing. Even simple song details and descriptions should be readily accessible when listening to the song, which a few users complained about before. Nimbus is not designed to replace SoundCloud, but serves as an alternative platform for streaming and discovering music that is built just for that after stripping away everything else.

## Screenshots
![As of 8/3/17](http://i.imgur.com/4NaQ14j.png "Nimbus")
![Search](http://i.imgur.com/ye4kyMg.png "Search")![Settings](http://i.imgur.com/IgPWBBg.png "Settings")
![Charts](http://i.imgur.com/LC55WDP.png "Charts")![Queue](http://i.imgur.com/WcJee0O.png "Queue")
<p align="center">Nimbus as of 8/3/17</p>

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

## Download for Chrome
You can download the standalone app for Chrome OS devices (Chrome store no longer shows new apps for other platforms) [here](https://chrome.google.com/webstore/detail/nimbus-music/kddhelajnednobefibdobkcldimhkooc).

## TODO
* Locally store favorited tracks in new favorites tab
* Improve UI
* Connect to SoundCloud account
# videojs-comscore

comScore support with videojs players.

## Getting Started
Download [videojs](http://www.videojs.com/)

In your web page:

```html
<link rel="stylesheet" href="video-js.css">
<video id="video"
       class="video-js vjs-default-skin"
       src="movie.mp4"
       controls>
</video>
<script src="video.js"></script>
<script src="dist/videojs.comscore.min.js"></script>
<script>
videojs('video', {}, function() {
  var player = this;
  player.comscore(myComscoreId, playlist, optionalKeymap); // initialize the plugin
});
</script>
```

## Lingo

comScore has the notion of segments (aka clips), and those segments can be ads, videos, audio-only, etc. comScore tracks these pieces of content as clips, and differentiates between ads and content via by sending an extra param or not, respectively. So, you may have five clips to comprise only one "episode" of a show, for instance. comScore often refers to a show name as either the "program name" or "series name."

The "classification", or "classification type" is a special code that gets sent to comScore. Which code is sent is dependent on a few main factors: if it's an ad or not, if it's long form or not (longer than 10 minutes), if it's premium or user-generated, and if it's live or not. There are [some other things too](src/videojs.comscore.coffee#L39), but that covers the most common stuff.

## Documentation

When initializing the comScore plugin, you need to provide it with at least two arguments. The first argument will be your comScore Client ID that is unique to your comScore account. The second argument will be a playlist of clips (we'll get to that soon), and the third is an optional keymap (we'll get to that last since, you know... it's optional).

#### playlist of clips (array)
The second argument supplied to the comScore plugin should be an array of clips. If you're not using the optional keymap argument, then this playlist will need to conform to the default keymap, which basically just means that the keys you see below need to stay the same, and you'll supply the values. A playlist should be an array of objects just like this one:

```javascript
ad: false, // is this clip an ad?
duration: 343000, // video duration in ms
id: 'adfa89fasd9f8asdf', // my unique id
name: 'My Super Awesome Video', // video's name
publisher: 'Brandon Aaskov', // publisher name (e.g. Viacom, Fullscreen, Viddy)
show: 'Testing comScore, with Brandon Aaskov',
url: 'http://vjs.zencdn.net/v/oceans.mp4' // url to the video (for tracking only - doesn't need to be the actual asset url)
```

At the time of this writing, nothing is required so any mandatory fields required for comScore must be filled out.


#### _keymap (object)_
If you don't use a keymap, it means that the data structure in your playlist array has to conform to something specific (see above). However, that seems like kind of a dick move so we provided the option of a keymap to override what keys we should be looking up. Let's walk through an example: if the third argument supplied to `player.comscore()` looked like this...

```javascript
{
  url: 'videoLocation',
  name: 'displayName'
}
```

Then the plugin will expect that each clip item in the playlist array will have a key called `videoLocation` and another called `displayName`, and that the values should map to what the plugin is calling `url` and `name`. Thus, the right values get sent to comScore.

## Examples
Run `gulp` and then load up [http://localhost:3000/src/index.html](http://localhost:3000/src/index.html) to see a player in action. If you're looking for examples for [keymapping](#keymap-object), then check out [a full keymap example in the tests folder](tests/mocks/keymappedPlaylist.js) and check out the [default keymap](src/videojs.comscore.coffee#L24) for reference.

#### basic setup
```javascript
//grab the player reference
var video = document.querySelector('video');
var player = videojs(video);

//prep the comscore stuff
var comScoreId = 1234567890;
var firstClip = {
  id: 45234532,
  name: 'Zencoder test video',
  publisher: 'Zencoder',
  url: 'http://vjs.zencdn.net/v/oceans.mp4'
};
var secondClip = {
  id: 'adas23490d8fasd9f8asd9f08ad0f',
  name: 'Test Video',
  show: 'Hampton Testing',
  duration: 900000, // in ms
  publisher: 'Brandon Aaskov',
  ad: false,
  url: 'https://s3-us-west-1.amazonaws.com/fullscreen-tv/uploads/balloon+jump+480p.mp4'
};
var playlist = [firstClip, secondClip];

player.comscore(1234567890, playlist);
```

If you wanted to use an optional keymap, using the same example above...

```javascript
//our clips with custom keys
var firstClip = {
  id: 45234532,
  displayName: 'Zencoder test video',
  publisher: 'Zencoder',
  videoLocation: 'http://vjs.zencdn.net/v/oceans.mp4'
};
var secondClip = {
  id: 'adas23490d8fasd9f8asd9f08ad0f',
  displayName: 'Test Video',
  show: 'Hampton Testing',
  duration: 900000, // in ms
  publisher: 'Brandon Aaskov',
  ad: false,
  videoLocation: 'https://s3-us-west-1.amazonaws.com/fullscreen-tv/uploads/balloon+jump+480p.mp4'
};

//our new keymap object
var keymap = {
  url: 'videoLocation',
  name: 'displayName'
};

player.comscore(1234567890, playlist, keymap);
```

## Classification Types
[As described above](#lingo), the classification type is required by comScore. If you don't set anything, we send the default value. However, if you'd like to send the _proper_ value, you can easily do so by specifying the following properties in your playlist items:
* ad (true/false)
* ugc (true/false)
* premium (true/false)
* duration (in milliseconds)
* live (true/false)

## Release History
* 0.2.0
tested and works much better, but still unverified from comScore (stay tuned...)

* 0.1.0
totally untested and unverified, but it appears to be working properly :)

## Development
I opted for `gulp` over `grunt` because I'm a much bigger fan of programming stuff with node streams than trying to declare everything I want through a big javascript config. Tests are via QUnit, which wouldn't have been my first choice but that's what got setup during the `grunt-init videojs` phase so I just stuck with it.

#### Prerequisites
To get things up and running, simply `npm install` from the project's directory. You may need to install gulp globally with `npm install -g gulp` so that the command line utility can run.

#### Compilation and Testing Server
`gulp` takes care of this for you, but the common tasks are:
`gulp` (tests (see below), watches ('scripts' and 'tests' folders) and starts a server
`gulp test` (builds (see below) and tests (in qunit))
`gulp build` (compiles, copies (to dist) compresses (in dist))

### Tests
You can run tests from the command line with `gulp test` though `gulp` does that by default as well (see above). Since they're QUnit tests, you can load them up in a browser as well. Assuming you have a server running after running `gulp`, you can just go to [http://localhost:3000/tests/index.html](http://localhost:3000/tests/index.html).

# License
This project uses the [Mozilla Public Foundation 2.0 License](http://www.mozilla.org/MPL/2.0/).

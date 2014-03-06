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
Check out example.html to see videojs-comscore in action.

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

## Release History
0.1.0 : totally untested and unverified, but it appears to be working properly :)
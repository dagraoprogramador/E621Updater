/*TODO: Create a second proxy, again, to speed things up, currently it takes half a second to fetch each post, which tracks to 
e621's fetch policy. So just alternate between fetching from one proxy to the other.

TODO2: Make the tagsearch button halt all current operations, so that you can press it as soon as it loads without any trouble
*/
//Getting information from the last page
const username = sessionStorage.getItem('username') || 'powerguido';
console.log("Username being searched: " + username);
var daterange = sessionStorage.getItem('daterange');

//getting the document objects
var contentarea = document.querySelector("div#allcontent");
const animationtoggle = document.querySelector("input#animationtoggle");
const taglist = document.querySelector("input#taglist");
const tagsubmit = document.querySelector("input#tagbutton");
const tagtext = document.querySelector("p#tagtext");

//setting up the arrays beforehand(necessary)
var alltheartists = [];
var requiredtags = [];
const unwantedartists = ['sound_warning', 'conditional_dnp', 'epilepsy_warning', 'third-party_edit'];//Idk if "artist-unknown" is a category for that, or just an artist's name

//Calculating the date after which the posts will be displayed
daterange = daterange==null ? 24 : parseInt(daterange);
var acceptabledate = new Date(Date.now() - (daterange * 60 * 60 * 1000)).toISOString().slice(0, 13);
console.log("Searching for posts made after " + acceptabledate + ", as i should");



async function fetchingJob() {
    const title = document.querySelector("h1#titleheader");
    title.innerHTML = "Searching for updates";
    title.style.color = "red";
    const subtitle = document.querySelector("p#subtitle");

    //resetting all the content
    contentarea.remove();
    contentarea = document.createElement('div');
    contentarea.id = "allcontent"
    document.body.appendChild(contentarea)

    await fetch(`https://updater-backend.vercel.app/api/proxy?url=https%3A%2F%2Fe621.net%2Fposts.json%3Ftags%3Dfav%3A${username}%26limit%3D320`)
    .then(r => r.json()).then(favposts => favposts.posts.forEach(post => alltheartists.push(post.tags.artist)));
    const tempartists = new Set(alltheartists.flat(Infinity).filter(artist => !unwantedartists.includes(artist)));
    alltheartists = Array.from(tempartists);
    console.log(alltheartists.map((el, index) => `${index+1} - ${el}`).join("\n"));


    const querytags = requiredtags.join("%2B")
    const artpromises = alltheartists.map(artist => {
        return fetch(`https://updater-backend.vercel.app/api/proxy?url=https%3A%2F%2Fe621.net%2Fposts.json%3Ftags%3D${querytags}%2B${artist}%26limit%3D5`)
        .then(r => r.json()).then(artist => {//TODO: Put the tag filtration system here, in a for loop, looping through each post until you get one that meets the requirements
            return [artist.posts[0], artist.posts[1], artist.posts[2], artist.posts[3], artist.posts[4]];
        });//TODO: If you become somewhat competent, make this more efficient, right now it's fetching all the artist, even if you specify one in the tags... if querytags contains artist, turn artist blank
    });

    const results = await Promise.all(artpromises).then(p => p.flat(1));
    if (results.length === 0) {
        title.innerHTML = "No updates were found!";
    };

    results.forEach(post => {
        if (!post) return; //Reminder to erase this when you put the tag filtration system up there, there won't be empty objects then
        title.innerHTML = "There has been a new update!";
        title.style.color = "green";
        subtitle.hidden = true;
        
//Lesson: Turns out an array with arrays gets turned into an object with names as the arrays, so you have to extract the values(arrays) first
        if (post.created_at.slice(0,13) >= acceptabledate){
            addPostThumbnail(post.tags.artist.filter(artist => !unwantedartists.includes(artist)).join(", "), post.sample.url, post.id, post.file.ext);
        };
    });
};


function addPostThumbnail(artistname, imageurl, sourceurl, postformat) { console.log(`New post from: ${artistname}`);
    const hyperlink = document.createElement("a");
    hyperlink.classList.add('content')
    hyperlink.classList.add((postformat=='webm' || postformat=='gif')? 'video' : 'image');
    hyperlink.href = `https://e621.net/posts/${sourceurl}`;
    const wholethumbnail = document.createElement("div");
    wholethumbnail.classList.add("thumbarea");
    const thumbimage = document.createElement("img");
    thumbimage.classList.add("thumbnail");
    const thumbtext = document.createElement("p");
    thumbtext.classList.add("thumbtext");

    /*
    When i need to debug shit and don't want to risk anyone peeking at depravities on the puter*/
    var tempimage;
    switch (Math.floor(Math.random() * 5)){
        case 1:
            tempimage = "https://r4.wallpaperflare.com/wallpaper/81/388/855/anime-cityscape-landscape-scenery-wallpaper-a334226641c935cf2b3701ca2a245274.jpg"
            break;
        case 2:
            tempimage = "https://www.endangeredwolfcenter.org/wp-content/uploads/2021/11/MJS_5861-Daisy_3-1.jpg.webp"
            break;
        case 3:
            tempimage = "https://i.pinimg.com/474x/c5/7f/32/c57f3237ffca4c4b8dd563e6dd94fed4.jpg"
            break
        case 4:
            tempimage = "https://files.worldwildlife.org/wwfcmsprod/images/Maned_Wolf_WWwinter2023/magazine_medium/6r8hu6p5qh_Maned_Wolf_WWwinter2023.jpg"
            break;
    };
    thumbimage.src = tempimage;
    //thumbimage.src = imageurl;
    thumbtext.innerHTML = artistname;
    wholethumbnail.appendChild(thumbimage);
    wholethumbnail.appendChild(thumbtext);
    hyperlink.appendChild(wholethumbnail);
    contentarea.appendChild(hyperlink);
}

tagsubmit.addEventListener('click', async () => {
    tagsubmit.disabled = true;
    var blacklisttags = taglist.value.split(" ")

    var listedtags = [];

    await Promise.all(blacklisttags.map(async tag => {
        await fetch(`https://updater-backend.vercel.app/api/proxy?url=https%3A%2F%2Fe621.net%2Fposts.json%3Ftags%3D${tag}%26limit%3D1`)
        .then(page => page.json()).then(res => {
            if (res.status === 404) {
                tagtext.innerHTML = `${tag} isn't a valid tag, bitch`
            } else {
                listedtags.push(tag);
            };
        })
    }))
    console.log("Listed tags: " + listedtags)

    if (listedtags.length === blacklisttags.length) {
        requiredtags = blacklisttags;
        await fetchingJob();
        tagsubmit.disabled = false;
    }
});


fetchingJob();
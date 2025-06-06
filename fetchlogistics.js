//Getting information from the last page
const username = localStorage.getItem('username');
console.log("Username being searched: " + username);
var daterange = localStorage.getItem('daterange');

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
daterange = daterange == null ? 24 : parseInt(daterange);
var acceptabledate = new Date(Date.now() - (daterange * 60 * 60 * 1000)).toISOString().slice(0, 13);
console.log("Searching for posts made after " + acceptabledate + ", as i should");



async function fetchingJob() {
    const title = document.querySelector("h1#titleheader");
    const subtitle = document.querySelector("p#subtitle");
    title.innerHTML = "Searching for updates";
    title.style.color = "red";
    subtitle.innerHTML = "Maybe wait for a while"

    //resetting all the content
    var tempartists = [];
    contentarea.remove();
    contentarea = document.createElement('div');
    contentarea.id = "allcontent"
    document.body.appendChild(contentarea)

    for (let page = 1; (tempartists.length % 319 == 0 || page == 1); page++) {
        await fetch(`https://updater-backend.vercel.app/api/proxy?url=https%3A%2F%2Fe621.net%2Fposts.json%3Ftags%3Dfav%3A${username}%26limit%3D320%26page%3D${page}`)
            .then(r => r.json()).then(artpage => artpage.posts.forEach(post => tempartists.push(post.tags.artist)));
    }

    console.log("Amount of favorited posts: " + alltheartists.length)
    const artistset = new Set(tempartists.flat(Infinity).filter(artist => !unwantedartists.includes(artist)));
    alltheartists = Array.from(artistset);
    console.log(alltheartists.map((el, index) => `${index + 1} - ${el}`).join("\n"));


    var fetchtoggle = '';
    const querytags = requiredtags.join("%2B");

    const artpromises = alltheartists.map(artist => {
        if (requiredtags.includes(`-${artist}`)) return; //If artist is excluded, don't even search it.
        fetchtoggle = fetchtoggle === '' ? '-2' : '';
        return fetch(`https://updater-backend${fetchtoggle}.vercel.app/api/proxy?url=https%3A%2F%2Fe621.net%2Fposts.json%3Ftags%3D${querytags}%2B${artist}%26limit%3D5`)
            .then(r => r.json()).then(artist => artist.posts[0]);
    });

    const results = await Promise.all(artpromises).then(p => p.flat(1));
    if (results.length === 0) {
        title.innerHTML = "No updates were found!";
    };

    results.forEach(post => {
        if (!post) return;
        title.innerHTML = "There has been a new update!";
        title.style.color = "green";
        subtitle.hidden = true;

        //Lesson: In json array with arrays gets turned into an array with name objects as the arrays, so you have to extract the values(arrays) first, "Object.values"
        if (post.created_at.slice(0, 13) >= acceptabledate) {
            addPostThumbnail(post.tags.artist.filter(artist => !unwantedartists.includes(artist)).join(", "), post.sample.url, post.id);
        };
    });
};


function addPostThumbnail(artistname, imageurl, sourceurl) {
    console.log(`New post from: ${artistname}`);
    const hyperlink = document.createElement("a");
    hyperlink.classList.add('content')
    hyperlink.href = `https://e621.net/posts/${sourceurl}`;
    const wholethumbnail = document.createElement("div");
    wholethumbnail.classList.add("thumbarea");
    const thumbimage = document.createElement("img");
    thumbimage.classList.add("thumbnail");
    const thumbtext = document.createElement("p");
    thumbtext.classList.add("thumbtext");


    /* When i need to debug shit and don't want to risk anyone peeking at depravities on the puter
    switch (Math.floor(Math.random() * 6)){
        case 1:
            imageurl = "https://r4.wallpaperflare.com/wallpaper/81/388/855/anime-cityscape-landscape-scenery-wallpaper-a334226641c935cf2b3701ca2a245274.jpg"
            break;
        case 2:
            imageurl = "https://www.endangeredwolfcenter.org/wp-content/uploads/2021/11/MJS_5861-Daisy_3-1.jpg.webp"
            break;
        case 3:
            imageurl = "https://i.pinimg.com/474x/c5/7f/32/c57f3237ffca4c4b8dd563e6dd94fed4.jpg"
            break
        case 4:
            imageurl = "https://files.worldwildlife.org/wwfcmsprod/images/Maned_Wolf_WWwinter2023/magazine_medium/6r8hu6p5qh_Maned_Wolf_WWwinter2023.jpg"
            break;

        default:
            imageurl = "https://fotos.amomeupet.org/uploads/stories/story_164_659d548852c56.webp"

    };*/

    thumbimage.src = imageurl;
    thumbtext.innerHTML = artistname;
    wholethumbnail.appendChild(thumbimage);
    wholethumbnail.appendChild(thumbtext);
    hyperlink.appendChild(wholethumbnail);
    contentarea.appendChild(hyperlink);
}


tagsubmit.addEventListener('click', async () => {
    tagsubmit.disabled = true;
    await tagsearch();
    tagsubmit.disabled = false;
});

async function tagsearch() {
    var inputtags = taglist.value.split(" ")
    console.log("Tags in input: " + inputtags)
    var invalidtags = [];

    await Promise.all(inputtags.map(async tag => {
        await fetch(`https://updater-backend.vercel.app/api/proxy?url=https%3A%2F%2Fe621.net%2Fposts.json%3Ftags%3D${tag}%26limit%3D1`)
            .then(page => page.json()).then(res => {
                if (res.posts[0] == null) {
                    invalidtags.push(tag)
                } else {
                    requiredtags.push(tag)
                };
            })
    }))

    if (invalidtags.length > 0) {
        tagtext.innerHTML = `${invalidtags.split(", ")} ain't valid, bitch`;
    } else {
        fetchingJob()
    }
}


fetchingJob();
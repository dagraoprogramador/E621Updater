const username = sessionStorage.getItem('username') || 'powerguido';
var daterange = sessionStorage.getItem('daterange');
const contentarea = document.querySelector("div#allcontent");
const animationtoggle = document.querySelector("input#animationtoggle");
var alltheartists = [];
const unwantedtags = ['sound_warning', 'conditional_dnp', 'artist-unknown', 'epilepsy_warning', 'third-party_edit'];

daterange = daterange==null ? 24 : parseInt(daterange);
var acceptabledate = new Date(Date.now() - (daterange * 60 * 60 * 1000)).toISOString().slice(0, 13);
console.log("Searching for posts made after " + acceptabledate + ", as requested");


async function fetchingJob() {
    await fetch(`https://updater-backend.vercel.app/api/proxy?url=https%3A%2F%2Fe621.net%2Fposts.json%3Ftags%3Dfav%3A${username}%26limit%3D320`)
    .then(r => r.json()).then(favposts => favposts.posts.forEach(post => alltheartists.push(post.tags.artist)));
    const tempartists = new Set(alltheartists.flat(Infinity).filter(artist => !unwantedtags.includes(artist)));
    alltheartists = Array.from(tempartists);
    console.log(alltheartists.map((el, index) => `${index+1} - ${el}`).join("\n"));

    const artpromises = alltheartists.map(artist => {
        return fetch(`https://updater-backend.vercel.app/api/proxy?url=https%3A%2F%2Fe621.net%2Fposts.json%3Ftags%3D${artist}%26limit%3D5`)
        .then(r => r.json()).then(artist => {
            return [artist.posts[0], artist.posts[1], artist.posts[2], artist.posts[3], artist.posts[4]];
        });
    });

    const results = await Promise.all(artpromises).then(p => p.flat(1));
    
    results.forEach(post => {
        if (!post) return;
        if (post.created_at.slice(0,13) >= acceptabledate){
            addPostThumbnail(post.tags.artist.filter(artist => !unwantedtags.includes(artist)).join(", "), post.sample.url, post.id, post.file.ext);
        };
    });
};


function addPostThumbnail(artistname, imageurl, sourceurl, postformat) { console.log(`New post from: ${artistname}`);
    const hyperlink = document.createElement("a");
    hyperlink.classList.add((postformat=='webm' || postformat=='gif')? 'contentvideo' : 'contentimage');
    hyperlink.href = `https://e621.net/posts/${sourceurl}`;
    const wholethumbnail = document.createElement("div");
    wholethumbnail.classList.add("content");
    const thumbimage = document.createElement("img");
    thumbimage.classList.add("thumbnail");
    const thumbtext = document.createElement("p");
    thumbtext.classList.add("thumbtext");

    /*
    When i need to debug shit and don't want to risk anyone peeking at depravities on the puter
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
            tempimage = "https://files.worldwildlife.org/wwfcmsprod/images/Maned_Wolf_WWwinter2023/magazine_medium/6r8hu6p5qh_Maned_Wolf_WWwinter2023.jpg?gp-1"
            break;
    };
    thumbimage.src = tempimage;*/
    thumbimage.src = imageurl;
    thumbtext.innerHTML = artistname;
    wholethumbnail.appendChild(thumbimage);
    wholethumbnail.appendChild(thumbtext);
    hyperlink.appendChild(wholethumbnail);
    contentarea.appendChild(hyperlink);
}

animationtoggle.addEventListener("change", function() {
    if (this.checked) {
        document.querySelectorAll(".contentimage").forEach(el => el.hidden=true);
        //images.forEach(el => el.hidden=true);
        console.log("Hiding image posts, as commanded!")
    }
    else {
        document.querySelectorAll(".contentimage").forEach(el => el.hidden=false);
        console.log("Showing image posts, as commanded!")
    }
});

fetchingJob();
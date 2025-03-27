const username = sessionStorage.getItem('username') || 'powerguido';
var daterange = sessionStorage.getItem('daterange');
const contentarea = document.querySelector("div#allcontent");
var alltheartists = [];
const unwantedtags = ['sound_warning', 'conditional_dnp', 'artist-unknown', 'epilepsy_warning', 'third-party_edit'];

daterange = daterange==null ? 24 : parseInt(daterange);
var acceptabledate = new Date(Date.now() - (24 * 60 * 60 * 1000)).toISOString().slice(0, 13);
console.log("Today is " + acceptabledate)


async function fetchingJob() {
    await fetch(`https://updater-backend.vercel.app/api/proxy?url=https%3A%2F%2Fe621.net%2Fposts.json%3Ftags%3Dfav%3A${username}%26limit%3D319`)
    .then(r => r.json()).then(favposts => favposts.posts.forEach(el => alltheartists.push(el.tags.artist)));
    const tempartists = new Set(alltheartists.flat(Infinity).filter(artist => !unwantedtags.includes(artist)));
    alltheartists = Array.from(tempartists);
    console.log(alltheartists.map((el, index) => `${index+1} - ${el}`).join("\n"));

    const artpromises = alltheartists.map(artist => {
        return fetch(`https://updater-backend.vercel.app/api/proxy?url=https%3A%2F%2Fe621.net%2Fposts.json%3Ftags%3D${artist}%26limit%3D1`)
        .then(r => r.json()).then(pages => pages.posts[0]);
    })

    results = await Promise.all(artpromises);
    
    results.forEach(post => {
        if (post.created_at.slice(0,13) >= acceptabledate){
            addPostThumbnail(post.tags.artist.filter(artist => !unwantedtags.includes(artist)), post.sample.url, post.id)
        }
    })
}


function addPostThumbnail(artistname, imageurl, sourceurl) { console.log(`New post from: ${artistname}`);
    const hyperlink = document.createElement("a")
    hyperlink.href = sourceurl
    const wholethumbnail = document.createElement("div");
    wholethumbnail.classList.add("content");
    const thumbimage = document.createElement("img");
    thumbimage.classList.add("thumbnail");
    const thumbtext = document.createElement("p");
    thumbtext.classList.add("thumbtext");

    thumbimage.src = imageurl;
    thumbtext.innerHTML = artistname;
    wholethumbnail.appendChild(thumbimage);
    wholethumbnail.appendChild(thumbtext);
    hyperlink.appendChild(wholethumbnail);
    contentarea.appendChild(hyperlink);
}

fetchingJob();
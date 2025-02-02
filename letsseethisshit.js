const username = sessionStorage.getItem('username');
var allTheSauces = [];
var allTheArtists = [];
var unwantedTags = ['sound_warning', 'conditional_dnp', 'artist-unknown', 'epilepsy_warning', 'third-party_edit'];
var daterangeraw = sessionStorage.getItem('daterange');
const daterange = daterangeraw==null ? 24 : parseInt(daterangeraw);
sessionStorage.clear();

console.log('Hours range: ' + daterange);
console.log(username)

async function vamoLa() {

    //TODO: Make a fetch for each page of results, preferably a recursive loop. The max one page can display is 319 posts.
    console.log('Username: ' + username);
    //fetching api in json form, but giving myself an "id", otherwise the site won't let me.
    const responseFavs = await fetch(`https://updater-backend.vercel.app/api/proxy?url=https%3A%2F%2Fe621.net%2Fposts.json%3Ftags%3Dfav%3A${username}%26limit%3D319`);

    const favPosts = await responseFavs.json();
    console.log(favPosts.posts.length)
    const postArtists = favPosts.posts.map(el => el.tags.artist); //taking each element from all of the favorites and getting the artist tag

    seriousCleanup(postArtists);

    console.log('All the artists: ' + allTheArtists.length);
};

function seriousCleanup(artists){

    artists.forEach((artgroup) => {//for each array of artists, filter the objects that passes these conditions
        var acceptedArtists = artgroup.filter((artist) => artist && !unwantedTags.includes(artist) && !allTheArtists.includes(artist));
        acceptedArtists.forEach(el => allTheArtists.push(el)); //because the filter returns an array, i extract each object
    });
    console.log(allTheArtists.length);
    getThemBoy();
};

async function getThemBoy(){

    var today = new Date(Date.now() - (daterange * 60 * 60 * 1000)).toISOString().split(':')[0]; //Calculating the time range
    console.log("Counting posts from: " + today);
    const updateText = document.querySelector('h1.updateText');
    const progressText = document.querySelector('p.progressText');
    const contentArea = document.querySelector('section.content');
    const elementArtCount = document.querySelector('p.artcount');
    var artCount = allTheArtists.length - 1;
    

    for(let number = 0; number < allTheArtists.length; number++){

        elementArtCount.innerHTML = `Artists remaining: ${artCount}`;
        await new Promise(r => setTimeout(r, 400));
        
        //encoded the url, because the special symbols(&, :, =, etc.) would've been perceived as part of the proxy, instead of the query
        let lastPostTemp = await fetch(`https://updater-backend.vercel.app/api/proxy?url=https%3A%2F%2Fe621.net%2Fposts.json%3Ftags%3D${allTheArtists[number]}%26limit%3D1`);
        let lastPostTempJson = await lastPostTemp.json();
        let postDateRaw = lastPostTempJson.posts.map(el => el.created_at);
        let postDate = postDateRaw[0].split(':')[0];
        console.log(allTheArtists[number] + " last post: " + postDate);

        progressText.innerHTML = (allTheArtists[number]);
        progressText.style.color = 'red';
        artCount--;

        if(postDate >= today){
            console.log('There has been a new post, from: ' + allTheArtists[number]);
            updateText.innerHTML = 'There has been an update';
            updateText.style.color = 'green';

            const artistArea = document.createElement('a');
            artistArea.classList.add('itemVideo');
            artistArea.setAttribute('href', `https://www.e621.net/posts?tags=${allTheArtists[number]}`);
            artistArea.setAttribute('target', '_blank')
            const artistText = document.createTextNode(allTheArtists[number]);

            progressText.style.color = 'green'
            
            artistArea.appendChild(artistText);
            contentArea.appendChild(artistArea);
            
        }
        
        

    }
    
    progressText.innerHTML = 'All up to date!';
    progressText.style.color = 'Black';
    
}


window.onload = vamoLa();
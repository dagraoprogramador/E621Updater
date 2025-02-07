//Grabbing elements from another page
const username = sessionStorage.getItem('username') || 'powerguido';
var daterange = sessionStorage.getItem('daterange');
sessionStorage.clear(); //clearing them for when you reload the page, avoids conflict, i guess
daterange = daterange==null ? 24 : parseInt(daterange);
const today = new Date(Date.now() - (daterange * 60 * 60 * 1000)).toISOString().slice(0, 13); //Calculating the time range

//defining all the arrays, globally
var allTheSauces = [];
var allTheArtists = [];
var unwantedTags = ['sound_warning', 'conditional_dnp', 'artist-unknown', 'epilepsy_warning', 'third-party_edit'];

//grabbing the elements from the page
const updateText = document.querySelector('h1.updateText');
const progressText = document.querySelector('p.progressText');
const contentArea = document.querySelector('section.content');
const elementArtCount = document.querySelector('p.artcount');

console.log("Counting posts from: " + today);
console.log('Hours range: ' + daterange);
console.log('Username: ' + username);

async function vamoLa() {

    //TODO: Make a fetch for each page of results, preferably a recursive loop. The max one page can display is 319 posts.
    //fetching api in json form, but giving myself an "id", otherwise the site won't let me.
    const favPosts = 
    await fetch(`https://updater-backend.vercel.app/api/proxy?url=https%3A%2F%2Fe621.net%2Fposts.json%3Ftags%3Dfav%3A${username}%26limit%3D319`)
    .then(r => r.json());
    console.log("Favorite posts count: " + favPosts.posts.length)
    const postArtists = favPosts.posts.map(el => el.tags.artist); //taking each element from all of the favorites and putting the artist tag in an array

    seriousCleanup(postArtists);

    console.log('All the artists: ' + allTheArtists);
};

function seriousCleanup(artists){

    //Set is faster to lookup, and can't have duplicates
    const uniqueartists = new Set(artists.flatMap(rawartists => rawartists)//flatMap dismantles the arrays into it's objects, adding them to a new array
    .filter(artist => artist && !unwantedTags.includes(artist)));
    allTheArtists = [...uniqueartists]//the three dots is to add the objects in the array to the artists, instead of the whole array
    console.log('How many artists: ' + allTheArtists.length);
    getThemBoy();
};

async function getThemBoy(){

    var artCount = allTheArtists.length - 1;
    

    for(let number = 0; number < allTheArtists.length; number++){

        elementArtCount.innerHTML = `Artists remaining: ${artCount}`;
        //await new Promise(r => setTimeout(r, 250));

        proxyvariation = number&1 ? '' : '-2';

        //encoded the url, because the special symbols(&, :, =, etc.) would've been perceived as part of the proxy url, instead of the query
        let lastPostTemp =  await fetch(`https://updater-backend${proxyvariation}.vercel.app/api/proxy?url=https%3A%2F%2Fe621.net%2Fposts.json%3Ftags%3D${allTheArtists[number]}%26limit%3D1`);
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
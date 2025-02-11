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

let elementusername = document.querySelector('p.username');
elementusername.innerHTML = `Displaying for: ${username}`

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
};

function seriousCleanup(artists){
    //Set is faster to lookup, and can't have duplicates
    const uniqueartists = new Set(artists.flatMap(rawartists => rawartists)//flatMap dismantles the arrays into it's objects, adding them to a new array
    .filter(artist => artist && !unwantedTags.includes(artist)));
    allTheArtists = [...uniqueartists]//the three dots is to add the objects of the array to the artists, instead of the whole array
    console.log('How many artists: ' + allTheArtists.length);
    console.log('All the artists: \n' + allTheArtists.map((el, index) => `${index+1} - ${el}`).join("\n"));//Makes it more readable    
    getThemBoy();
};

async function getThemBoy(){
    
    var artCount = allTheArtists.length;
    console.log("Amount of artists: " + artCount)
    
    for(const artist of allTheArtists){
        
        artCount--;
        elementArtCount.innerHTML = `Artists remaining: ${artCount}`;
        
        proxyvariation = artCount&1 ? '' : '-2';
        
        //encoded the url, because the special symbols(&, :, =, etc.) would've been perceived as part of the proxy url, instead of the query
        const postdateraw =  await fetch(`https://updater-backend${proxyvariation}.vercel.app/api/proxy?url=https%3A%2F%2Fe621.net%2Fposts.json%3Ftags%3D${artist}%26limit%3D1`)
        .then(r => r.json());
        let postdate = postdateraw.posts[0]?.created_at?.slice(0, 13);
        console.log(artist + ' last post was in: ' + postdate);
        
        progressText.innerHTML = (artist);
        progressText.style.color = 'red';
        
        if(postdate >= today){
            console.log('There has been a new post, from: ' + artist);
            updateText.innerHTML = 'There has been an update';
            updateText.style.color = 'green';
            
            const artistArea = document.createElement('a');
            artistArea.classList.add('itemVideo');
            artistArea.setAttribute('href', `https://www.e621.net/posts?tags=${artist}`);
            const artistText = document.createTextNode(artist);
            
            progressText.style.color = 'green'
            
            artistArea.appendChild(artistText);
            contentArea.appendChild(artistArea);           
        };
    };
    
    progressText.innerHTML = 'All up to date!';
    progressText.style.color = 'Black';   
}


window.onload = vamoLa();
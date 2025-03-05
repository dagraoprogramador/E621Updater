//TODO: Uncloud this shit, some global variables are not meant to be

//Grabbing elements from another page
const username = sessionStorage.getItem('username') || 'powerguido';
var daterange = sessionStorage.getItem('daterange');
//sessionStorage.clear(); //clearing them for when you reload the page, avoids conflict, i guess... NVM IT CREATES CONFLICT
daterange = daterange==null ? 24 : parseInt(daterange);
const today = new Date(Date.now() - (daterange * 60 * 60 * 1000)).toISOString().slice(0, 13); //Calculating the time range

//defining all the arrays, globally
var allTheArtists = [];
var unwantedTags = ['sound_warning', 'conditional_dnp', 'artist-unknown', 'epilepsy_warning', 'third-party_edit'];

//Displaying the username of who's being searched to avoid confusion
let elementusername = document.querySelector('p.username');
elementusername.innerHTML = `Displaying for: ${username}`;

console.log("Counting posts from: " + today);
console.log('Hours range: ' + daterange);

async function vamoLa() {
    //TODO: Make a fetch for each page of results, preferably a recursive loop. The max one page can display is 319 posts.
    const favPosts = 
    await fetch(`https://updater-backend.vercel.app/api/proxy?url=https%3A%2F%2Fe621.net%2Fposts.json%3Ftags%3Dfav%3A${username}%26limit%3D319`)
    .then(r => r.json());
    const postArtists = favPosts.posts.map(el => el.tags.artist); //taking each post from all of the favorites and putting the artist tag in an array
    console.log("Favorite posts count: " + favPosts.posts.length);
    
    seriousCleanup(postArtists);
};

function seriousCleanup(artists){
    //Set is faster to lookup, and can't have duplicates
    const uniqueartists = new Set(artists.flatMap(rawartists => rawartists)//flatMap dismantles the arrays into it's objects, adding them to a new array
    .filter(artist => !unwantedTags.includes(artist)));
    allTheArtists = [...uniqueartists]//the three dots is to add the objects of the array, instead of the whole array
    console.log('How many artists: ' + allTheArtists.length);
    console.log('All the artists: \n' + allTheArtists.map((el, index) => `${index+1} - ${el}`).join("\n"));//Makes it more readable    
    getThemBoy();
};

async function getThemBoy(){
    //Setting up the page elements in here to avoid cluster in the rest of the code
    const updateText = document.querySelector('h1.updateText');
    const progressText = document.querySelector('p.progressText');
    const contentArea = document.querySelector('section.content');
    const elementArtCount = document.querySelector('p.artcount');
    
    var artCount = allTheArtists.length;
    console.log("Amount of artists: " + artCount);
    
    const artPromises = allTheArtists.map((artist) => {
        return fetch(`https://updater-backend.vercel.app/api/proxy?url=https%3A%2F%2Fe621.net%2Fposts.json%3Ftags%3D${artist}%26limit%3D1`)
        .then(r => r.json());
    });

    const results = await Promise.all(artPromises);

    console.log('Today: ' + today)
    for(resultIndex in results){
        await new Promise(resolve => setTimeout(resolve, 100));
        postDate = results[resultIndex].posts[0].created_at.slice(0, 13);
        artist = allTheArtists[resultIndex]
        console.log(artist + "'s last post: " + postDate)

        progressText.innerHTML = (artist);
        progressText.style.color = 'red';

        artCount--;
        elementArtCount.innerHTML = `Artists remaining: ${artCount}`;

        if(postDate >= today){
            updateText.style.color = 'green';
            updateText.innerHTML = 'There has been an update!'
            progressText.style.color = 'green';

            const artistArea = document.createElement('a');
            artistArea.classList.add('itemVideo');
            artistArea.href = `https://e621.net/posts?tags=${artist}`;
            artistArea.target = '_blank'
            artistArea.textContent = artist;
            contentArea.appendChild(artistArea);
        }
    };
    
    progressText.innerHTML = 'All up to date!';
    progressText.style.color = 'Black';   
}

window.onload = vamoLa();
// Connect server

var socket = io("http://localhost:5500");
socket.emit("state:allUsers");




// User constants

const ssiBar = $('.ssi_bar');
const storyBtn = $('.ssi_bar #storyBtn');
const storyScr = $('.ssi_bar #storyScreen');
const settingBtn = $('.ssi_bar #settingBtn');
const settingScr = $('.ssi_bar #settingScreen');
const settingContent = $('.ssi_bar #settingScreen .setting_content');
const storyText = $('.ssi_bar #storyScreen .text');
const NavUpBtn = $('.navigate .up');
const NavPageBtn = $('.navigate .page-mark');
const NavDownBtn = $('.navigate .down');

const initialScr = $('.initial_screen');
const settingList = $('.initial_screen .setting_list div');
let usernameInputDiv = $('.initial_screen #usernameInputDiv');
let usernameInput = $('.initial_screen #usernameInput');
let newRoomBtnDiv = $('.initial_screen #newRoomBtnDiv');
const newRoomBtn = $('.initial_screen #newRoomBtn');
let roomIDInput = $('.initial_screen #roomCodeInput');
const joinRoomBtn = $('.initial_screen #joinRoomBtn');

const restroomScr = $('.restroom_screen');
const roomIDMessage = $('.restroom_screen h3');
const leaveRoomBtn = $('.restroom_screen #leaveRoomBtn');
const startGameBtn = $('.restroom_screen #startGameBtn');
const player_list = $(".player_list #show_player_list");
let playerBoxes = $(".player_list #show_player_list .box");
const colorOptns = $('.restroom_screen .color_options .option');
const sliders = $('.restroom_screen .customize div');
const ranges = $('.restroom_screen .customize div input');
const characterSVG = $('.update .character');

const gameScr = $('.game_screen');
const treasureScr = $('.game_screen .treasure');
const caveScr = $('.game_screen .cave');
const caveChr = $('.cave .character');
const roleName = $('.game_screen #role');
const timeDisplay = $('.game_screen #time');
const activateBtn = $('.game_screen #activateBtn');
const voteBtn = $('.game_screen #voteBtn');
const chests = $('.game_screen .chests .option');
const roleScr = $('.role_screen');
const roleMes = $('#role_mes');
const roleDesc = $('#role_desc');
const roleChr = $('.role_screen .character');
const activateScr = $('.activate_screen');

const voteScr = $('.vote_screen');
const voteList = $('.vote_screen #show_vote_list');
const skipBtn = $('.vote_screen #skipVoteBtn');
const leaderboard = $('.leaderboard #show_leaderboard');

let currentPage = 0;
const role = ["Captain", "Killer", "Blacksmith", "Pirate"];
let gameStats = [2, 5, 30, 90];
let selectedColor;
let randomID = [];
let room_size = playerBoxes.length;
let players = [];
let leavePlayers = [];
let inLeaveState = false;
let playingRooms = [];

characterSVG.html($('.textures .spriteDiv').html());
voteList.html(player_list.html());

const randomRoomID = function() {
    return Math.floor(Math.random() * 90000) + 10000;
}

const chestList = function(ul, n) {
    let chest;
    for (let i = 0; i < n; i++){
        chest = $('<li>').addClass('option').text(i + 1);
        ul.append(chest);
    }
}

const createChestLists = function(n) {
    const list_60 = $('.game_screen .chests .c60');
    const list_80 = $('.game_screen .chests .c80');
    const list_120 = $('.game_screen .chests .c120');

    const n120 = Math.floor((n + 2) / 7);
    const n60 = Math.floor((n - 1 - n120) / 2);
    const n80 = Math.floor((n - 2 - n120) / 2);

    chestList(list_60, n60);
    chestList(list_80, n80);
    chestList(list_120, n120);
}

// A player base on id (in players)
const getCurrentPlayer = function(id) {
    return players.find(player => player.id === id);
}

// A player base on id (in leavePlayers)
const getLeavePlayer = function(id) {
    return leavePlayers.find(player => player.id === id);
}

const getRoomUsers = function(room) {
    return players.filter(player => player.room === room);
}

const getActiveRooms = function() {
    return new Set(players.map(player => player.room));
}

// A list of active player names
const getActiveNames = function() {
    return players.map(player => player.username);
}

// A list of player names in leaveRoom state
const getLeaveNames = function() {
    return leavePlayers.map(player => player.username);
}

const checkValidName = function(activeUsernames, leaveUsernames){
    if (!usernameInput.val() || usernameInput.val().length > 16){
        alert("Your username must have around 1-16 character(s)!!!");
        return false;
    }
    if (activeUsernames.includes(usernameInput.val()) || leaveUsernames.includes(usernameInput.val())){
        alert("Existed username!!!");
        return false;
    }
    return true;
}

const checkValidRoom = function(rooms, roomID){
    if (!roomIDInput.val()){
        alert("Forgot to enter room ID!!!");
        return false;
    }
    if (!rooms.has(roomID)){
        alert("Invalid room ID!!!");
        return false;
    }
    if (playingRooms.length >0 && playingRooms.includes(roomID)){
        alert(`Room ${roomID} has started`);
        return false;
    }
    return true;
}

const getUsedColors = function() {
    return players.map(player => player.colorID);
}

// Default color of a player
const getDefaultColor = function() {
    for (let i = 0; i < colorOptns.length; i++) {
        if (!colorOptns.eq(i).hasClass('chosen')){
            return i;
        }
    }
    return -1;
}

const getBoxIndex = function() {
    for (let i = 0; i < playerBoxes.length; i++) {
        if (playerBoxes.eq(i).hasClass('current')){
            return i;
        }
    }
    return -1;
}

const getBoxByName = function(username) {
    for (let i = 0; i < playerBoxes.length; i++) {
        if (playerBoxes.eq(i).find('p').text() === username){
            return playerBoxes.eq(i);
        }
    }
    return null;
}

const randomRole = function(i) {
    if (randomID[i] === 0) {
        return role[0];
    }
    else if (randomID[i] <= gameStats[0]) {
        return role[1];
    }
    else if (randomID[i] === gameStats[0] + 1){
        return role[2];
    }
    else return role[3];
}

const drawSprite_restroomScr = function(boxID, colorID){
    selectedColor = colorOptns.eq(colorID).css('background-color');
    playerBoxes.eq(boxID).find('.color').find('.hatcls-2').css('fill', selectedColor);
    characterSVG.find('.cls-8').css('fill', selectedColor);
}

const drawRoleScr = function() {
    let i = getBoxIndex();
    roleMes.text(randomRole(i));
    if (randomID[i] === 0) {
        roleDesc.html("<p>Nhiệm vụ của bạn là tìm ra Killer đang trà trộn trong đoàn, sống sót và chiến thắng cùng Pirate.</p><p>Mỗi lượt tìm kho báu, bạn có quyền theo dõi tình hình 1 kho báu bất kỳ trước khi chọn kho báu.</p><p>Bạn biết được thân phận những thủy thủ trong đoàn.</p>");
        roleMes.css('color', 'goldenrod');
        roleDesc.css('color', 'rgb(117, 86, 0)');
    }
    else if (randomID[i] <= gameStats[0]) {
        roleDesc.html("<p>Nhiệm vụ của bạn là cố gắng sống sót và kiếm được nhiều tiền nhất.</p><p>Mỗi lượt săn, bạn có thể giết 1 Pirate nếu chỉ có Pirate đó săn cùng kho báu với bạn. Nếu giết thành công 1 Pirate, bạn lấy được gợi ý thân phận của Captain.</p><p>Bạn không biết được thân phận những thủy thủ trong đoàn.</p>");
        roleMes.css('color', 'firebrick');
        roleDesc.css('color', 'rgb(117, 0, 0)');
    }
    else if (randomID[i] === gameStats[0] + 1){
        roleDesc.html("<p>Nhiệm vụ của bạn là bảo vệ các thành viên trong đoàn.</p><p>Mỗi lượt săn, bạn sẽ ngẫu nhiên nâng cấp trang bị cho 1 thành viên đi săn cùng kho báu với bạn (ưu tiên Captain). Thành viên được nâng cấp trang bị sẽ không bị giết trong lượt tiếp theo. Bạn không thể tự bảo vệ bản thân trừ lượt đầu tiên.</p><p>Bạn chỉ biết được thân phận của Captain</p>");
        roleMes.css('color', 'dodgerblue');
        roleDesc.css('color', 'rgb(0, 57, 114)');
    }
    else {
        roleDesc.html("<p>Nhiệm vụ của bạn là tìm giết Killer đang trà trộn trong đoàn.</p><p>Bạn không nhớ được thân phận những thủy thủ trong đoàn.</p><p>Tham gia săn kho báu cùng đồng minh sẽ giúp bạn tăng điểm thân mật. Đạt đủ điểm thân mật bạn sẽ nhận được thông tin của thủy thủ trong đoàn</p>");
        roleMes.css('color', 'forestgreen');
        roleDesc.css('color', 'rgb(0, 82, 0)');
    }
}

const drawSprite_roleScr = function(roomUsers) {
    let currentPlayer = getCurrentPlayer(socket.id);
    if (currentPlayer.role !== "Killer"){
        roleChr.html($('.textures .spriteDiv').html());
        roleChr.find('.cls-8').css('fill', selectedColor);
        return;
    }
    for (let i = 0; i < roomUsers.length; i++){
        if (roomUsers[i].role === "Killer"){
            let chosenColor = playerBoxes.eq(i).find('.color').find('.hatcls-2').css('fill');
            roleChr.append($('.textures .spriteDiv').html());
            $('.character .sprite:last-child').find('.cls-8').css('fill', chosenColor);
        }
    }
};

const updateNav = function(currentPage){ 
    for (let i = 0; i < NavPageBtn.length; i++){
    storyText.eq(i).css("display", "none");
    NavPageBtn.eq(i).css("background-image", "url('Textures/Navigate/Normal.png')");
    if (i == currentPage) {
        storyText.eq(i).css("display", "block");
        NavPageBtn.eq(i).css("background-image","url('Textures/Navigate/Active.png')");

    }
}}

const updateVolBtn = function(vol, volBtn) {
    switch (true) {
        case (vol.val() == 0):
            volBtn.css('background-image', "url('Textures/sound_vol_level0.png')"); 
            break;
        case (vol.val() <= 33):
            volBtn.css('background-image', "url('Textures/sound_vol_level1.png')"); 
            break;
        case (vol.val() <= 66):
            volBtn.css('background-image', "url('Textures/sound_vol_level2.png')"); 
            break;
        case (vol.val() <= 100):
            volBtn.css('background-image', "url('Textures/sound_vol_level3.png')"); 
            break;
    }
}




// User events

$(window).on('mouseup', function(e) {
    const container = $('.activate_screen, #storyScreen, #settingScreen');
    if (ssiBar.hasClass('on_screen')){ 
        ssiBar.removeClass('on_screen');
    }
    if (!container.is(e.target) && container.has(e.target).length === 0){
        container.fadeOut();
    }
});

/*
* INITIAL SCREEN
*/

settingBtn.on('click', function() {
    settingScr.css('display', 'block');
    ssiBar.addClass('on_screen');
    for (let j = 0; j < settingList.length; j++){
        settingList.eq(j).removeClass('choosen');
        settingContent.eq(j).css('display', 'none');
        
    }
    settingList.eq(0).addClass('choosen');
    settingContent.eq(0).css('display', 'block');
});

storyBtn.on('click', function() {
    currentPage = 0;
    updateNav(currentPage);
    storyScr.css('display', 'block');
    ssiBar.addClass('on_screen');
});

// ssiBar.on('click', function(){
//     ssiBar.removeClass('on_screen');
// });


newRoomBtn.on("click", function() {
    const activeUsernames = getActiveNames(players);
    const leaveUsernames = getLeaveNames();
    const rooms = getActiveRooms(players);
    const roomID = randomRoomID().toString();
    while (rooms.has(roomID)){
        roomID = randomRoomID().toString();
    }
    if (!inLeaveState){
        // Check valid
        if (!checkValidName(activeUsernames, leaveUsernames)) return;
    
        // Handle room
        const username = usernameInput.val();
        socket.emit("room:join", true, username, roomID);
        roomIDMessage.text("ID: " + roomID);

        // Modify swap room
        usernameInputDiv.html(``);
        usernameInputDiv.append(`<p>Welcome ${usernameInput.val()}</p>`);
        $('.initial_screen h4').remove();
    }
    else {
        let currentPlayer = getLeavePlayer(socket.id);
        socket.emit("room:join", true, currentPlayer.username, roomID);
        roomIDMessage.text("ID: " + roomID);

    }

    // Handle color
    setTimeout(() => {
        const index = getDefaultColor();
        colorOptns.eq(index).addClass('selected');
        drawSprite_restroomScr(getBoxIndex(), index);
        socket.emit("room:chooseColor", roomID, index);
    }, 50);

    // Handle swap room
    usernameInput.val('');
    roomIDInput.val('');
    restroomScr.css('display', "grid");
    initialScr.css('display', "none");
});

joinRoomBtn.on('click', function() {
    const rooms = getActiveRooms(players);
    const roomID = roomIDInput.val();
    if (!checkValidRoom(rooms, roomID)) return;
    if (!inLeaveState){
        // Check valid
        const activeUsernames = getActiveNames(players);
        const leaveUsernames = getLeaveNames();
        if (!checkValidName(activeUsernames, leaveUsernames)) return;

        // Handle room
        const username = usernameInput.val();
        socket.emit("room:join", false, username, roomID);
        roomIDMessage.text("ID: " + roomID);

        // Modify swap room
        usernameInputDiv.html(``);
        usernameInputDiv.append(`<p>Welcome, ${usernameInput.val()}</p>`);
        $('.initial_screen h4').remove();
    }
    else {
        // Handle room
        let currentPlayer = getLeavePlayer(socket.id);
        socket.emit("room:join", false, currentPlayer.username, roomID);
        roomIDMessage.text("ID: " + roomID);
    }

    // Handle color
    setTimeout(() => {
        const index = getDefaultColor();
        colorOptns.eq(index).addClass('selected');
        drawSprite_restroomScr(getBoxIndex(), index);
        socket.emit("room:chooseColor", roomID, index);
    }, 50);

    // Handle swap room
    ranges.hide();
    startGameBtn.hide();
    usernameInput.val('');
    roomIDInput.val('');
    restroomScr.css('display', "grid");
    initialScr.css('display', "none");
});

for (let i=0; i < settingList.length; i++){
    settingList.eq(i).on('click', function () {
        for (let j = 0; j < settingList.length; j++){
            settingList.eq(j).removeClass('choosen');
            settingContent.eq(j).css('display', 'none');
            
        }
        settingList.eq(i).addClass('choosen');
        settingContent.eq(i).css('display', 'block');
    })
}

// Navigate story

NavUpBtn.on('click', function() {
    currentPage = (currentPage + 3) % 4;
    updateNav(currentPage);
});

NavDownBtn.on('click', function() {
    currentPage = (currentPage + 1) % 4;
    updateNav(currentPage);
});

for (let i = 0; i < NavPageBtn.length; i++){
    NavPageBtn.eq(i).on('click', function() {
        currentPage = i;
        updateNav(currentPage);
})}

/*
* RESTROOM SCREEN
*/

leaveRoomBtn.on('click', function() {
    inLeaveState = true;
    let currentPlayer = getCurrentPlayer(socket.id);
    colorOptns.eq(currentPlayer.colorID).removeClass('selected');
    let leaveIndex = players.indexOf(currentPlayer);
    if (leaveIndex > -1){
        players.splice(leaveIndex, 1);
    }
    socket.emit("room:leave", leaveIndex);   
    initialScr.css('display', "flex");
    restroomScr.css('display', "none");
});

startGameBtn.on('click', function() {
    room_size = playerBoxes.length;
    if (room_size < 2 || room_size > 12){
        alert("Game should be started with around 5-12 players!!!");
        return;
    }
    socket.emit("game:start", getCurrentPlayer(socket.id).room, room_size);
});

for (let i = 0; i < sliders.length; i++) {
    let range = sliders.eq(i).find('input');
    let val = sliders.eq(i).find('span');
    val.text(range.val());
    range.on('input', function() {
        gameStats[i] = parseInt(range.val());
        socket.emit("room:customize", getCurrentPlayer(socket.id).room, gameStats);
    });
}

for (let i = 0; i < colorOptns.length; i++){
    colorOptns.eq(i).on('click', function() {
        const elem = $('.color_options .selected');
        if (elem != null) elem.removeClass('selected');
        colorOptns.eq(i).addClass('selected');
        drawSprite_restroomScr(getBoxIndex(), i);
        socket.emit("room:chooseColor", getCurrentPlayer(socket.id).room, i);
    });
}

/*
* GAME SCREEN
*/

activateBtn.on('click', function() {
    activateScr.css('display', 'flex');
});

voteBtn.on('click', function() {
    voteScr.css('display', 'grid');
    voteList.html(player_list.html());
    voteBoxes = $('#show_vote_list .box');
    for (let i = 0; i < voteBoxes.length; i++) {
        // Add leaderboard
        const poster = $('<div>').addClass('poster');
        if (playerBoxes.eq(i).hasClass('current')) poster.addClass('current');
        poster.append(`<p>WANTED</p>`);
        poster.append(voteBoxes.eq(i).html());
        poster.append(`<span>0$</span>`);
        leaderboard.append(poster);

        // Add event
        voteBoxes.eq(i).on('click', function() {
            const elem = $('#show_vote_list .selected');
            if (elem != null) elem.removeClass('selected');
            voteBoxes.eq(i).addClass('selected');
        });
    }
});

skipBtn.on('click', function(){
    const elem = $('#show_vote_list .selected');
    if (elem != null) elem.removeClass('selected');
});

for (let i = 0; i < chests.length; i++) {
    chests.eq(i).on('click', function() {
        const elem = $('.chests .option.selected');
        if (elem != null) elem.removeClass('selected');
        chests.eq(i).addClass('selected');
        socket.emit("game:huntChest", getCurrentPlayer(socket.id).room, i);
        treasureScr.fadeOut();
        caveScr.fadeIn();
        caveScr.css('display', 'flex');
    });
}

// Socket events

socket.on("state:allUsers", function(activeUsers, leaveUsers, playRooms){
    players = activeUsers;
    leavePlayers = leaveUsers;
    playingRooms = playRooms;
});

socket.on("room:listing", function(roomUsers) {
    let currentPlayer = getCurrentPlayer(socket.id);
    if (roomUsers.length){
        if (roomUsers[0].username == currentPlayer.username){
            ranges.show();
            startGameBtn.show();
        }
    } 
    player_list.html(``);
    roomUsers.forEach(player => {
        const playerDiv = $('<div>').addClass('box');
        playerDiv.append($('.textures .colorDiv').html());
        playerDiv.append(`<p>${player.username}</p>`);
        player_list.append(playerDiv);
        if (player.id === socket.id) {
            $(".player_list #show_player_list .box:last-child").addClass('current');
        }
    });
    playerBoxes = $(".player_list #show_player_list .box");
});

socket.on("game:start", function(temp, roomUsers, roomData) {
    randomID = temp;
    createChestLists(roomUsers.length);
    drawRoleScr();
    drawSprite_roleScr(roomUsers);
    roleName.text("Role: " + roleMes.text());
    restroomScr.css('display', "none");
    roleScr.css('display', "flex");
    setTimeout(function() {
        roleScr.fadeOut();
        gameScr.css('display', "grid");
    }, 8000);
    
    roomData.chestList.forEach(chest => {
        treasureScr.append('<div id="'+chest.id +'" class="chest"></div>');
        const chestDiv = $('#'+chest.id);
        chestDiv.css('top', String(chest.position[0])+"em");
        chestDiv.css('left', String(chest.position[1])+"em");
        switch (chest.value) {
            case 120:
                chestDiv.addClass('c120')
                break;
            case 80:
                chestDiv.addClass('c80')
                break;
            case 60:
                chestDiv.addClass('c60')
                break;
            case 40:
                chestDiv.addClass('c40')
                break;
        }
    });
});

socket.on("room:customize", function(stats) {
    gameStats = stats;
    for (let i = 0; i < sliders.length; i++) {
        sliders.eq(i).find('span').text(gameStats[i]);
    }
});

socket.on("room:coloring", function(roomUsers) {
    const elem = $('.color_options .chosen');
    if (elem != null) elem.removeClass('chosen');
    for (let i = 0; i < roomUsers.length; i++){
        let circle_i = colorOptns.eq(roomUsers[i].colorID);
        if (roomUsers[i].id !== socket.id && roomUsers[i].colorID > -1){
            let chosenColor = circle_i.css('background-color');
            circle_i.addClass('chosen');
            playerBoxes.eq(i).find('.color').find('.hatcls-2').css('fill', chosenColor);
            characterSVG.find('.cls-8').css('fill', selectedColor);
        }
        else {
            drawSprite_restroomScr(getBoxIndex(), roomUsers[i].colorID);
        }
    };
});

socket.on("game:timing", function(timer){
    timeDisplay.text("Time: " + timer.toString() + ' s');
});

socket.on("game:huntChest", function(chestHunters, id){
    if (getCurrentPlayer(socket.id).chestID !== id) return;
    caveChr.html(``);
    for (let i = 0; i < chestHunters.length; i++){
        let chosenColor = getBoxByName(chestHunters[i].username).find('.color').find('.hatcls-2').css('fill');
        caveChr.append($('.textures .spriteDiv').html());
        $('.character .sprite:last-child').find('.cls-8').css('fill', chosenColor);
    }
});

/*
SOUND AND MUSIC
*/

const musicVol = $('#settingMusic #musicVol input');
const soundVol = $('#settingMusic #soundVol input');
const musicVolSpan = $('#settingMusic #musicVol span');
const soundVolSpan = $('#settingMusic #soundVol span');
const musicVolBtn = $('#settingMusic #musicVol div');
const soundVolBtn = $('#settingMusic #soundVol div');
const backgroundMusic = $('.background_music')[0];
const interactionSound1 = $('.interaction_sound').eq(0)[0];
const interactionSound2 = $('.interaction_sound').eq(1)[0];
let musicMute = false;
let soundMute = false;

function cloneAndPlay(audioNode) {
    // the true parameter will tell the function to make a deep clone (cloning attributes as well)
    var clone = audioNode.cloneNode(true);
    clone.volume = interactionSound2.volume
    clone.play();
}

function setMusicVol(vol){
    for (let i = 0; i < $('.background_music').length; i++) {
        $('.background_music').eq(i)[0].volume = vol;
    }
}
function setSoundVol(vol) {
    for (let i = 0; i < $('.interaction_sound').length; i++) {
        $('.interaction_sound').eq(i)[0].volume = vol;
    }
}

$(window).on('mouseup', function(){
    backgroundMusic.play();
})

setMusicVol(musicVol.val()/100);
setSoundVol(soundVol.val()/100);
musicVolSpan.text(musicVol.val());
soundVolSpan.text(soundVol.val());
updateVolBtn(musicVol, musicVolBtn);
updateVolBtn(soundVol, soundVolBtn);

musicVolBtn.on('click', function() {
    if (musicMute) {
        updateVolBtn(musicVol, musicVolBtn);
        setMusicVol(musicVol.val()/100);
    }
    else {
        musicVolBtn.css('background-image', "url('Textures/sound_vol_mute.png')");
        setMusicVol(0);
    }
    musicMute = !musicMute;
});

soundVolBtn.on('click', function() {
    if (soundMute) {
        updateVolBtn(soundVol, soundVolBtn);
        setSoundVol(soundVol.val()/100);
    }
    else {
        soundVolBtn.css('background-image', "url('Textures/sound_vol_mute.png')");
        setSoundVol(0);
    }
    soundMute = !soundMute;
});

musicVol.on('input', function() {
    musicVolSpan.text(musicVol.val());
    setMusicVol(musicVol.val()/100);
    updateVolBtn(musicVol, musicVolBtn);
})
soundVol.on('input', function() {
    soundVolSpan.text(soundVol.val());
    setSoundVol(soundVol.val()/100);
    updateVolBtn(soundVol, soundVolBtn);
})

start = 0;
step = 2;
$('.slide_sound').on('input', function(){
    if (start%step == 0){
        cloneAndPlay(interactionSound1);
    }
    start++
})
    
$('.click_sound').on('click', function () {
    cloneAndPlay(interactionSound2);
})

//Test 
// voteScr.css('display', 'grid');
// initialScr.css('display', 'none');
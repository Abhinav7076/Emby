define(["layoutManager","inputManager","connectionManager","events","viewManager","libraryBrowser","appRouter","apphost","playbackManager","browser","globalize","paper-icon-button-light","material-icons","scrollStyles","flexStyles"],function(layoutManager,inputManager,connectionManager,events,viewManager,libraryBrowser,appRouter,appHost,playbackManager,browser,globalize){"use strict";function getCurrentApiClient(){return currentUser&&currentUser.localUser?connectionManager.getApiClient(currentUser.localUser.ServerId):connectionManager.currentApiClient()}function lazyLoadViewMenuBarImages(){require(["imageLoader"],function(imageLoader){imageLoader.lazyChildren(skinHeader)})}function onBackClick(){appRouter.back()}function updateUserInHeader(user){var hasImage;if(user&&user.name){if(user.imageUrl){var url=user.imageUrl;user.supportsImageParams&&(url+="&height="+Math.round(26*Math.max(window.devicePixelRatio||1,2))),updateHeaderUserButton(url),hasImage=!0}headerUserButton.classList.remove("hide")}else headerUserButton.classList.add("hide");hasImage||updateHeaderUserButton(null),user&&user.localUser?(headerHomeButton&&headerHomeButton.classList.remove("hide"),headerSearchButton&&headerSearchButton.classList.remove("hide"),headerSettingsButton&&(user.localUser.Policy.IsAdministrator?headerSettingsButton.classList.remove("hide"):headerSettingsButton.classList.add("hide")),headerCastButton.classList.remove("hide")):(headerHomeButton.classList.add("hide"),headerCastButton.classList.add("hide"),headerSearchButton&&headerSearchButton.classList.add("hide"),headerSettingsButton&&headerSettingsButton.classList.add("hide")),requiresUserRefresh=!1}function updateHeaderUserButton(src){src?(headerUserButton.classList.add("headerUserButtonRound"),headerUserButton.innerHTML='<img src="'+src+'" />'):(headerUserButton.classList.remove("headerUserButtonRound"),headerUserButton.innerHTML='<i class="md-icon">&#xE7FD;</i>')}function showSearch(){inputManager.trigger("search")}function onHeaderUserButtonClick(e){Dashboard.showUserFlyout(e.target)}function onHeaderHomeButtonClick(){Dashboard.navigate("home.html")}function bindMenuEvents(){(mainDrawerButton=document.querySelector(".mainDrawerButton"))&&mainDrawerButton.addEventListener("click",toggleMainDrawer);var headerBackButton=document.querySelector(".headerBackButton");headerBackButton&&headerBackButton.addEventListener("click",onBackClick),headerSearchButton&&headerSearchButton.addEventListener("click",showSearch),headerUserButton.addEventListener("click",onHeaderUserButtonClick),headerHomeButton.addEventListener("click",onHeaderHomeButtonClick),initHeadRoom(skinHeader),skinHeader.querySelector(".btnNotifications").addEventListener("click",function(){Dashboard.navigate("notifications.html")}),headerCastButton.addEventListener("click",onCastButtonClicked)}function onCastButtonClicked(){var btn=this;require(["playerSelectionMenu"],function(playerSelectionMenu){playerSelectionMenu.show(btn)})}function getItemHref(item,context){return appRouter.getRouteUrl(item,{context:context})}function toggleMainDrawer(){navDrawerInstance.isVisible?closeMainDrawer():openMainDrawer()}function openMainDrawer(){navDrawerInstance.open(),lastOpenTime=(new Date).getTime()}function onMainDrawerOpened(){layoutManager.mobile&&document.body.classList.add("bodyWithPopupOpen")}function closeMainDrawer(){navDrawerInstance.close()}function onMainDrawerSelect(e){navDrawerInstance.isVisible?onMainDrawerOpened():document.body.classList.remove("bodyWithPopupOpen")}function refreshLibraryInfoInDrawer(user,drawer){var html="";html+='<div style="height:.5em;"></div>',html+='<a class="navMenuOption lnkMediaFolder" href="home.html" onclick="return LibraryMenu.onLinkClicked(event, this);"><i class="md-icon navMenuOptionIcon">&#xE88A;</i><span>'+globalize.translate("ButtonHome")+"</span></a>",html+='<div class="libraryMenuDownloads">',html+='<div class="navMenuDivider"></div>',html+='<h3 class="sidebarHeader">',html+=globalize.translate("sharedcomponents#HeaderMyDownloads"),html+="</h3>",html+='<a class="navMenuOption lnkMediaFolder" data-itemid="manageoffline" onclick="return LibraryMenu.onLinkClicked(event, this);" href="offline/offline.html"><i class="md-icon navMenuOptionIcon">&#xE2C7;</i><span>'+globalize.translate("sharedcomponents#Browse")+"</span></a>",html+='<a class="navMenuOption lnkMediaFolder" data-itemid="manageoffline" onclick="return LibraryMenu.onLinkClicked(event, this);" href="managedownloads.html"><i class="md-icon navMenuOptionIcon">&#xE254;</i><span>'+globalize.translate("sharedcomponents#Manage")+"</span></a>",html+="</div>",html+='<div class="navMenuDivider"></div>',html+='<div class="libraryMenuOptions">',html+="</div>";var localUser=user.localUser;localUser&&localUser.Policy.IsAdministrator&&(html+='<div class="adminMenuOptions">',html+='<div class="navMenuDivider"></div>',html+='<h3 class="sidebarHeader">',html+=globalize.translate("HeaderAdmin"),html+="</h3>",html+='<a class="navMenuOption lnkMediaFolder lnkManageServer" data-itemid="dashboard" onclick="return LibraryMenu.onLinkClicked(event, this);" href="dashboard.html"><i class="md-icon navMenuOptionIcon">&#xE8B8;</i><span>'+globalize.translate("ButtonManageServer")+"</span></a>",html+='<a class="navMenuOption lnkMediaFolder editorViewMenu" data-itemid="editor" onclick="return LibraryMenu.onLinkClicked(event, this);" href="edititemmetadata.html"><i class="md-icon navMenuOptionIcon">&#xE2C7;</i><span>'+globalize.translate("MetadataManager")+"</span></a>",html+="</div>"),html+='<div class="userMenuOptions">',html+='<div class="navMenuDivider"></div>',user.localUser&&(html+='<a class="navMenuOption lnkMediaFolder lnkMySettings" onclick="return LibraryMenu.onLinkClicked(event, this);" href="mypreferencesmenu.html"><i class="md-icon navMenuOptionIcon">&#xE8B8;</i><span>'+globalize.translate("ButtonSettings")+"</span></a>"),html+='<a class="navMenuOption lnkMediaFolder lnkSyncToOtherDevices" data-itemid="syncotherdevices" onclick="return LibraryMenu.onLinkClicked(event, this);" href="mysync.html"><i class="md-icon navMenuOptionIcon">&#xE627;</i><span>'+globalize.translate("sharedcomponents#Sync")+"</span></a>",Dashboard.isConnectMode()&&(html+='<a class="navMenuOption lnkMediaFolder" data-itemid="selectserver" onclick="return LibraryMenu.onLinkClicked(event, this);" href="selectserver.html?showuser=1"><i class="md-icon navMenuOptionIcon">&#xE308;</i><span>'+globalize.translate("ButtonSelectServer")+"</span></a>"),!user.localUser||user.localUser.EnableAutoLogin&&!user.connectUser||(html+='<a class="navMenuOption lnkMediaFolder" data-itemid="logout" onclick="return LibraryMenu.onLogoutClicked(this);" href="#"><i class="md-icon navMenuOptionIcon">&#xE879;</i><span>'+globalize.translate("ButtonSignOut")+"</span></a>"),html+="</div>",navDrawerScrollContainer.innerHTML=html;var lnkManageServer=navDrawerScrollContainer.querySelector(".lnkManageServer");lnkManageServer&&lnkManageServer.addEventListener("click",onManageServerClicked)}function refreshDashboardInfoInDrawer(apiClient){currentDrawerType="admin",loadNavDrawer(),navDrawerScrollContainer.querySelector(".adminDrawerLogo")?updateDashboardMenuSelectedItem():createDashboardMenu(apiClient)}function isUrlInCurrentView(url){return-1!==window.location.href.toString().toLowerCase().indexOf(url.toLowerCase())}function updateDashboardMenuSelectedItem(){for(var links=navDrawerScrollContainer.querySelectorAll(".navMenuOption"),currentViewId=viewManager.currentView().id,i=0,length=links.length;i<length;i++){var link=links[i],selected=!1,pageIds=link.getAttribute("data-pageids");pageIds&&(pageIds=pageIds.split("|"),selected=-1!=pageIds.indexOf(currentViewId));var pageUrls=link.getAttribute("data-pageurls");if(pageUrls&&(pageUrls=pageUrls.split("|"),selected=pageUrls.filter(isUrlInCurrentView).length>0),selected){link.classList.add("navMenuOption-selected");var title="";link=link.querySelector("span")||link;title+=(link.innerText||link.textContent).trim(),LibraryMenu.setTitle(title)}else link.classList.remove("navMenuOption-selected")}}function createToolsMenuList(pluginItems){var links=[{name:globalize.translate("TabServer")},{name:globalize.translate("TabDashboard"),href:"dashboard.html",pageIds:["dashboardPage"],icon:"dashboard"},{name:globalize.translate("TabSettings"),href:"dashboardgeneral.html",pageIds:["dashboardGeneralPage"],icon:"settings"},{name:globalize.translate("TabUsers"),href:"userprofiles.html",pageIds:["userProfilesPage","newUserPage","editUserPage","userLibraryAccessPage","userParentalControlPage","userPasswordPage"],icon:"people"},{name:"Emby Premiere",href:"supporterkey.html",pageIds:["supporterKeyPage"],icon:"star"},{name:globalize.translate("TabLibrary"),href:"library.html",pageIds:["mediaLibraryPage","librarySettingsPage","libraryDisplayPage","metadataImagesConfigurationPage","metadataNfoPage"],icon:"folder",color:"#38c"},{name:globalize.translate("TabSubtitles"),href:"metadatasubtitles.html",pageIds:["metadataSubtitlesPage"],icon:"closed_caption"},{name:globalize.translate("TabPlayback"),icon:"play_circle_filled",color:"#E5342E",href:"cinemamodeconfiguration.html",pageIds:["cinemaModeConfigurationPage","playbackConfigurationPage","streamingSettingsPage"]},{name:globalize.translate("TabTranscoding"),icon:"transform",href:"encodingsettings.html",pageIds:["encodingSettingsPage"]},{divider:!0,name:globalize.translate("TabDevices")},{name:globalize.translate("TabDevices"),href:"devices.html",pageIds:["devicesPage","devicePage"],icon:"tablet"},{name:globalize.translate("HeaderDownloadSync"),icon:"file_download",href:"syncactivity.html",pageIds:["syncActivityPage","syncJobPage","syncSettingsPage"],color:"#009688"},{name:globalize.translate("TabCameraUpload"),href:"devicesupload.html",pageIds:["devicesUploadPage"],icon:"photo_camera"},{name:globalize.translate("DLNA"),href:"dlnasettings.html",pageIds:["dlnaSettingsPage","dlnaProfilesPage","dlnaProfilePage"],icon:"&#xE912;"},{divider:!0,name:globalize.translate("HeaderLiveTV")},{name:globalize.translate("TabLiveTV"),href:"livetvstatus.html",pageIds:["liveTvStatusPage","liveTvTunerPage"],icon:"&#xE639;"},{name:globalize.translate("DVR"),href:"livetvsettings.html",pageIds:["liveTvSettingsPage"],icon:"dvr"}];links.push({divider:!0,name:globalize.translate("TabExpert")}),links.push({name:globalize.translate("TabAdvanced"),icon:"settings",href:"dashboardhosting.html",color:"#F16834",pageIds:["dashboardHostingPage","serverSecurityPage"]}),links.push({name:globalize.translate("TabLogs"),href:"log.html",pageIds:["logPage"],icon:"folder_open"}),links.push({name:globalize.translate("TabNotifications"),icon:"notifications",color:"brown",href:"notificationsettings.html",pageIds:["notificationSettingsPage","notificationSettingPage"]}),links.push({name:globalize.translate("TabPlugins"),icon:"add_shopping_cart",color:"#9D22B1",href:"plugins.html",pageIds:["pluginsPage","pluginCatalogPage"]}),links.push({name:globalize.translate("TabScheduledTasks"),href:"scheduledtasks.html",pageIds:["scheduledTasksPage","scheduledTaskPage"],icon:"schedule"}),links.push({name:globalize.translate("MetadataManager"),href:"edititemmetadata.html",pageIds:[],icon:"mode_edit"});for(var i=0,length=pluginItems.length;i<length;i++){var pluginItem=pluginItems[i];Dashboard.allowPluginPages(pluginItem.PluginId)&&(pluginItem.EnableInMainMenu&&links.push({name:pluginItem.DisplayName,icon:"folder",href:Dashboard.getConfigurationPageUrl(pluginItem.Name),pageUrls:[Dashboard.getConfigurationPageUrl(pluginItem.Name)]}))}return links}function getToolsMenuLinks(apiClient){return apiClient.getJSON(apiClient.getUrl("web/configurationpages")+"?pageType=PluginConfiguration&EnableInMainMenu=true").then(createToolsMenuList,function(err){return createToolsMenuList([])})}function getToolsLinkHtml(item){var menuHtml="",pageIds=item.pageIds?item.pageIds.join("|"):"";pageIds=pageIds?' data-pageids="'+pageIds+'"':"";var pageUrls=item.pageUrls?item.pageUrls.join("|"):"";return pageUrls=pageUrls?' data-pageurls="'+pageUrls+'"':"",menuHtml+='<a class="navMenuOption" href="'+item.href+'"'+pageIds+pageUrls+">",item.icon&&(menuHtml+='<i class="md-icon navMenuOptionIcon">'+item.icon+"</i>"),menuHtml+="<span>",menuHtml+=item.name,menuHtml+="</span>",menuHtml+="</a>"}function getToolsMenuHtml(apiClient){return getToolsMenuLinks(apiClient).then(function(items){var i,length,item,menuHtml="";for(menuHtml+='<div class="drawerContent">',i=0,length=items.length;i<length;i++)item=items[i],item.divider&&(menuHtml+="<div class='navMenuDivider'></div>"),item.href?menuHtml+=getToolsLinkHtml(item):item.name&&(menuHtml+='<h3 class="sidebarHeader">',menuHtml+=item.name,menuHtml+="</h3>");return menuHtml+="</div>"})}function createDashboardMenu(apiClient){return getToolsMenuHtml(apiClient).then(function(toolsMenuHtml){var html="";html+='<a class="adminDrawerLogo clearLink" is="emby-linkbutton" href="home.html" style="text-align:left;">',html+='<img src="css/images/logoblack.png" />',html+="</a>",html+=toolsMenuHtml,html=html.split("href=").join('onclick="return LibraryMenu.onLinkClicked(event, this);" href='),navDrawerScrollContainer.innerHTML=html,updateDashboardMenuSelectedItem()})}function onSidebarLinkClick(){var section=this.getElementsByClassName("sectionName")[0],text=section?section.innerHTML:this.innerHTML;LibraryMenu.setTitle(text)}function getUserViews(apiClient,userId){return apiClient.getUserViews({},userId).then(function(result){for(var items=result.Items,list=[],i=0,length=items.length;i<length;i++){var view=items[i];if(list.push(view),"livetv"==view.CollectionType){view.ImageTags={},view.icon="live_tv";var guideView=Object.assign({},view);guideView.Name=globalize.translate("ButtonGuide"),guideView.ImageTags={},guideView.icon="dvr",guideView.url="livetv.html?tab=1",list.push(guideView)}}return list})}function showBySelector(selector,show){var elem=document.querySelector(selector);elem&&(show?elem.classList.remove("hide"):elem.classList.add("hide"))}function updateLibraryMenu(user){if(!user)return showBySelector(".libraryMenuDownloads",!1),showBySelector(".lnkSyncToOtherDevices",!1),void showBySelector(".userMenuOptions",!1);user.Policy.EnableContentDownloading?showBySelector(".lnkSyncToOtherDevices",!0):showBySelector(".lnkSyncToOtherDevices",!1),user.Policy.EnableContentDownloading&&appHost.supports("sync")?showBySelector(".libraryMenuDownloads",!0):showBySelector(".libraryMenuDownloads",!1);var userId=Dashboard.getCurrentUserId(),apiClient=getCurrentApiClient(),libraryMenuOptions=document.querySelector(".libraryMenuOptions");libraryMenuOptions&&getUserViews(apiClient,userId).then(function(result){var items=result,html="";html+='<h3 class="sidebarHeader">',html+=globalize.translate("HeaderMedia"),html+="</h3>",html+=items.map(function(i){var icon="folder",itemId=i.Id;return"channels"==i.CollectionType?itemId="channels":"livetv"==i.CollectionType&&(itemId="livetv"),"photos"==i.CollectionType?(icon="photo_library","#009688"):"music"==i.CollectionType||"musicvideos"==i.CollectionType?(icon="library_music","#FB8521"):"books"==i.CollectionType?(icon="library_books","#1AA1E1"):"playlists"==i.CollectionType?(icon="view_list","#795548"):"games"==i.CollectionType?(icon="games","#F44336"):"movies"==i.CollectionType?(icon="video_library","#CE5043"):"channels"==i.CollectionType||"Channel"==i.Type?(icon="videocam","#E91E63"):"tvshows"==i.CollectionType?(icon="tv","#4CAF50"):"livetv"==i.CollectionType&&(icon="live_tv","#293AAE"),icon=i.icon||icon,'<a data-itemid="'+itemId+'" class="lnkMediaFolder navMenuOption" onclick="return LibraryMenu.onLinkClicked(event, this, '+(i.onclick?" function(){"+i.onclick+"}":"null")+');" href="'+getItemHref(i,i.CollectionType)+'"><i class="md-icon navMenuOptionIcon">'+icon+'</i><span class="sectionName">'+i.Name+"</span></a>"}).join(""),libraryMenuOptions.innerHTML=html;for(var elem=libraryMenuOptions,sidebarLinks=elem.querySelectorAll(".navMenuOption"),i=0,length=sidebarLinks.length;i<length;i++)sidebarLinks[i].removeEventListener("click",onSidebarLinkClick),sidebarLinks[i].addEventListener("click",onSidebarLinkClick)})}function onManageServerClicked(){closeMainDrawer(),Dashboard.navigate("dashboard.html")}function getTopParentId(){return getParameterByName("topParentId")||null}function getNavigateDelay(){return browser.slow?320:200}function updateCastIcon(){var context=document,info=playbackManager.getPlayerInfo(),icon=headerCastButton.querySelector("i");info&&!info.isLocalPlayer?(icon.innerHTML="&#xE308;",headerCastButton.classList.add("castButton-active"),context.querySelector(".headerSelectedPlayer").innerHTML=info.deviceName||info.name):(icon.innerHTML="&#xE307;",headerCastButton.classList.remove("castButton-active"),context.querySelector(".headerSelectedPlayer").innerHTML="")}function updateLibraryNavLinks(page){var i,length,isLiveTvPage=page.classList.contains("liveTvPage"),isChannelsPage=page.classList.contains("channelsPage"),isEditorPage=page.classList.contains("metadataEditorPage"),isMySyncPage=page.classList.contains("mySyncPage"),id=isLiveTvPage||isChannelsPage||isEditorPage||isMySyncPage||page.classList.contains("allLibraryPage")?"":getTopParentId()||"",elems=document.getElementsByClassName("lnkMediaFolder");for(i=0,length=elems.length;i<length;i++){var lnkMediaFolder=elems[i],itemId=lnkMediaFolder.getAttribute("data-itemid");isChannelsPage&&"channels"==itemId?lnkMediaFolder.classList.add("navMenuOption-selected"):isLiveTvPage&&"livetv"==itemId?lnkMediaFolder.classList.add("navMenuOption-selected"):isEditorPage&&"editor"==itemId?lnkMediaFolder.classList.add("navMenuOption-selected"):isMySyncPage&&"manageoffline"==itemId&&-1!=window.location.href.toString().indexOf("mode=offline")?lnkMediaFolder.classList.add("navMenuOption-selected"):isMySyncPage&&"syncotherdevices"==itemId&&-1==window.location.href.toString().indexOf("mode=offline")?lnkMediaFolder.classList.add("navMenuOption-selected"):id&&itemId==id?lnkMediaFolder.classList.add("navMenuOption-selected"):lnkMediaFolder.classList.remove("navMenuOption-selected")}}function updateMenuForPageType(isDashboardPage,isLibraryPage){var newPageType=isDashboardPage?2:isLibraryPage?1:3;if(currentPageType!==newPageType){currentPageType=newPageType,isDashboardPage&&!layoutManager.mobile?skinHeader.classList.add("headroomDisabled"):skinHeader.classList.remove("headroomDisabled");var bodyClassList=document.body.classList;isLibraryPage?(bodyClassList.add("libraryDocument"),bodyClassList.remove("dashboardDocument"),bodyClassList.remove("hideMainDrawer"),navDrawerInstance&&navDrawerInstance.setEdgeSwipeEnabled(!0)):isDashboardPage?(bodyClassList.remove("libraryDocument"),bodyClassList.add("dashboardDocument"),bodyClassList.remove("hideMainDrawer"),navDrawerInstance&&navDrawerInstance.setEdgeSwipeEnabled(!0)):(bodyClassList.remove("libraryDocument"),bodyClassList.remove("dashboardDocument"),bodyClassList.add("hideMainDrawer"),navDrawerInstance&&navDrawerInstance.setEdgeSwipeEnabled(!1))}requiresUserRefresh&&connectionManager.user(getCurrentApiClient()).then(updateUserInHeader)}function updateTitle(page){var title=page.getAttribute("data-title");title?LibraryMenu.setTitle(title):page.classList.contains("standalonePage")&&LibraryMenu.setDefaultTitle()}function updateBackButton(page){headerBackButton||(headerBackButton=document.querySelector(".headerBackButton")),headerBackButton&&("false"!==page.getAttribute("data-backbutton")&&appRouter.canGoBack()?headerBackButton.classList.remove("hide"):headerBackButton.classList.add("hide"))}function initHeadRoom(elem){require(["headroom-window"],function(headroom){headroom.add(elem)})}function refreshLibraryDrawer(user){loadNavDrawer(),currentDrawerType="library",(user?Promise.resolve(user):connectionManager.user(getCurrentApiClient())).then(function(user){refreshLibraryInfoInDrawer(user),updateLibraryMenu(user.localUser)})}function getNavDrawerOptions(){var drawerWidth=screen.availWidth-50;return drawerWidth=Math.max(drawerWidth,240),drawerWidth=Math.min(drawerWidth,320),{target:navDrawerElement,onChange:onMainDrawerSelect,width:drawerWidth}}function loadNavDrawer(){return navDrawerInstance?Promise.resolve(navDrawerInstance):(navDrawerElement=document.querySelector(".mainDrawer"),navDrawerScrollContainer=navDrawerElement.querySelector(".scrollContainer"),new Promise(function(resolve,reject){require(["navdrawer"],function(navdrawer){navDrawerInstance=new navdrawer(getNavDrawerOptions()),navDrawerElement.classList.remove("hide"),resolve(navDrawerInstance)})}))}var navDrawerElement,navDrawerScrollContainer,navDrawerInstance,mainDrawerButton,headerHomeButton,currentDrawerType,pageTitleElement,headerBackButton,headerUserButton,currentUser,headerSettingsButton,headerCastButton,headerSearchButton,enableLibraryNavDrawer=!layoutManager.tv,skinHeader=document.querySelector(".skinHeader"),requiresUserRefresh=!0,lastOpenTime=(new Date).getTime();window.LibraryMenu={getTopParentId:getTopParentId,onLinkClicked:function(event,link,action){return 1!=event.which||((new Date).getTime()-lastOpenTime>200&&setTimeout(function(){closeMainDrawer(),setTimeout(function(){action?action():Dashboard.navigate(link.href)},getNavigateDelay())},50),event.stopPropagation(),event.preventDefault(),!1)},onLogoutClicked:function(){return(new Date).getTime()-lastOpenTime>200&&(closeMainDrawer(),setTimeout(function(){Dashboard.logout()},getNavigateDelay())),!1},onHardwareMenuButtonClick:function(){toggleMainDrawer()},onSettingsClicked:function(event){return 1!=event.which||(Dashboard.navigate("dashboard.html"),!1)},setTabs:function(type,selectedIndex,builder){require(["mainTabsManager"],function(mainTabsManager){type?mainTabsManager.setTabs(viewManager.currentView(),selectedIndex,builder,function(){return[]}):mainTabsManager.setTabs(null)})},setDefaultTitle:function(){pageTitleElement||(pageTitleElement=document.querySelector(".pageTitle")),pageTitleElement&&(pageTitleElement.classList.add("pageTitleWithLogo"),pageTitleElement.classList.add("pageTitleWithDefaultLogo"),pageTitleElement.style.backgroundImage=null,pageTitleElement.innerHTML=""),document.title="Emby"},setTitle:function(title){if(null==title)return void LibraryMenu.setDefaultTitle();var html=title,page=viewManager.currentView();if(page){var helpUrl=page.getAttribute("data-helpurl");helpUrl&&(html+='<a href="'+helpUrl+'" target="_blank" is="emby-linkbutton" class="button-link" style="margin-left:2em;" title="'+globalize.translate("ButtonHelp")+'"><i class="md-icon">&#xE88E;</i><span>'+globalize.translate("ButtonHelp")+"</span></a>")}pageTitleElement||(pageTitleElement=document.querySelector(".pageTitle")),pageTitleElement&&(pageTitleElement.classList.remove("pageTitleWithLogo"),pageTitleElement.classList.remove("pageTitleWithDefaultLogo"),pageTitleElement.style.backgroundImage=null,pageTitleElement.innerHTML=html),document.title=title||"Emby"},setTransparentMenu:function(transparent){transparent?skinHeader.classList.add("semiTransparent"):skinHeader.classList.remove("semiTransparent")}};var currentPageType;return pageClassOn("pagebeforeshow","page",function(e){this.classList.contains("withTabs")||LibraryMenu.setTabs(null)}),pageClassOn("pageshow","page",function(e){var page=this,isDashboardPage=page.classList.contains("type-interior"),isLibraryPage=!isDashboardPage&&page.classList.contains("libraryPage"),apiClient=getCurrentApiClient();isDashboardPage?(mainDrawerButton&&mainDrawerButton.classList.remove("hide"),refreshDashboardInfoInDrawer(apiClient)):(mainDrawerButton&&(enableLibraryNavDrawer?mainDrawerButton.classList.remove("hide"):mainDrawerButton.classList.add("hide")),"library"!==currentDrawerType&&refreshLibraryDrawer()),updateMenuForPageType(isDashboardPage,isLibraryPage),e.detail.isRestored||window.scrollTo(0,0),updateTitle(page),updateBackButton(page),updateLibraryNavLinks(page)}),function(){var html="";html+='<div class="flex align-items-center flex-grow headerTop">',html+='<div class="headerLeft">',html+='<button type="button" is="paper-icon-button-light" class="headerButton headerButtonLeft headerBackButton hide"><i class="md-icon">'+(browser.safari?"chevron_left":"&#xE5C4;")+"</i></button>",html+='<button type="button" is="paper-icon-button-light" class="headerButton headerHomeButton hide barsMenuButton headerButtonLeft"><i class="md-icon">&#xE88A;</i></button>',html+='<button type="button" is="paper-icon-button-light" class="headerButton mainDrawerButton barsMenuButton headerButtonLeft hide"><i class="md-icon">&#xE5D2;</i></button>',html+='<h3 class="pageTitle"></h3>',html+="</div>",html+='<div class="headerRight">',html+='<span class="headerSelectedPlayer"></span>',html+='<button is="paper-icon-button-light" class="headerCastButton castButton headerButton headerButtonRight hide"><i class="md-icon">&#xE307;</i></button>',html+='<button type="button" is="paper-icon-button-light" class="headerButton headerButtonRight headerSearchButton hide"><i class="md-icon">&#xE8B6;</i></button>',html+='<button is="paper-icon-button-light" class="headerButton headerButtonRight btnNotifications"><div class="btnNotificationsInner hide">0</div><i class="md-icon">&#xE7F4;</i></button>',html+='<button is="paper-icon-button-light" class="headerButton headerButtonRight headerUserButton hide"><i class="md-icon">&#xE7FD;</i></button>',layoutManager.mobile||(html+='<button is="paper-icon-button-light" class="headerButton headerButtonRight headerSettingsButton hide" onclick="return LibraryMenu.onSettingsClicked(event);"><i class="md-icon">&#xE8B8;</i></button>'),html+="</div>",html+="</div>",html+='<div class="headerTabs sectionTabs hide">',html+="</div>",skinHeader.classList.add("skinHeader-withBackground"),skinHeader.innerHTML=html,headerHomeButton=skinHeader.querySelector(".headerHomeButton"),headerUserButton=skinHeader.querySelector(".headerUserButton"),headerSettingsButton=skinHeader.querySelector(".headerSettingsButton"),headerCastButton=skinHeader.querySelector(".headerCastButton"),headerSearchButton=skinHeader.querySelector(".headerSearchButton"),browser.chrome||skinHeader.classList.add("skinHeader-blurred"),lazyLoadViewMenuBarImages(),bindMenuEvents()}(),events.on(connectionManager,"localusersignedin",function(e,user){currentDrawerType=null,currentUser={localUser:user},loadNavDrawer(),connectionManager.user(connectionManager.getApiClient(user.ServerId)).then(function(user){currentUser=user,updateUserInHeader(user)})}),events.on(connectionManager,"localusersignedout",function(){currentUser={},updateUserInHeader()}),events.on(playbackManager,"playerchange",updateCastIcon),loadNavDrawer(),LibraryMenu});
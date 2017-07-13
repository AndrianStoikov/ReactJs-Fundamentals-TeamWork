# Documentation

## Public part

The public part of our project is visible without authentication. This is the application start page, prompting the user to Register or Login to access the ‘Social network’. Contains Login and Register buttons, app Logo, Welcome text etc.

## Private part

The private part of the project is visible after authentication. It provides the user with personal area, accessible after successful login. This area holds: 

the user's profile management functionality 
Change profile picture 
Block user (prevents the blocked user from posting on your wall and sending personal messages to the ‘blocker’) 
the user's personal page (‘Wall’, containing posts of the current user) 
the user's contacts/friends/followed users
the user’s News Feed, containing posts from current user and posts from followed (friends) users
Links to pages that allow the user to Add New Posts or Comments, Edit or Delete his own Posts and Comments
Messenger page, allowing the user to send and receive private messages to and from other users.

## Administrative part

The project provides system administrator role. System administrators have access to the system and permissions to administer all major information objects in the system:  
add other administrators  
edit/delete user’s posts  
edit/delete user’s comments  

---

## Dynamic web pages (requires at least 15):

Welcome page  
Login page  
Register page  
User profile page  
Personal posts (wall)  
Link to Block Users Page   
Link to Change profile picture page  
Block users page (input field for username + block button)  
Change profile picture page  
News Feed page - contains current user’s posts and posts from users, that the current user follows (is friends with)  
User search page - accessible from search box in navbar  
Add post page  
Edit post page - users can edit their own posts  
Delete post page - users can delete their own posts  
Add comment page  
Edit comment page - users can edit their own comments  
Delete comment page - users can delete their own comments  
Admin panel page - contains functionality to add other admins. If user is Admin, he can Edit/Delete all Posts/Comments  
Messenger page - displays current active chats and search box that allows to start chat with users  
Messages page - displays the messages in an opened thread  

## DB Tables (requires at least 4):

Users  
Posts  
Comments  
Threads  
Messages  

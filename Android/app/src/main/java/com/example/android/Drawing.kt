package com.example.android

import android.graphics.Color
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import androidx.appcompat.app.ActionBar
import com.example.android.canvas.*
import com.example.android.chat.ChatDialog
import com.example.android.chat.ChatRooms
import com.example.android.chat.ClientMessage
import com.example.android.client.ActiveUser
import com.example.android.client.ClientInfo
import com.example.android.client.User
import com.google.gson.Gson
import kotlinx.android.synthetic.main.dessin.*
import top.defaults.colorpicker.ColorPickerPopup
import java.util.*
import kotlin.collections.HashMap

var selectionColors:HashMap<String, String?> = HashMap()
class Drawing : AppCompatActivity() {
    private var socket = SocketHandler.getChatSocket()
    private var drawingRelatedInformation: ReceiveDrawingInformation?= null
    private var drawingID: Int?= null
    private var canvas: CanvasView? = null
    private var chatRoomExists = false
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.dessin)

        supportActionBar!!.setDisplayShowHomeEnabled(true)
        supportActionBar!!.setDisplayOptions(ActionBar.DISPLAY_SHOW_CUSTOM)
        supportActionBar!!.setDisplayShowCustomEnabled(true)
        supportActionBar!!.setCustomView(R.layout.action_bar_general)
        val customActionBar = supportActionBar!!.customView
        val chatDrawing: ImageView = customActionBar
            .findViewById(R.id.showChatGeneral)

        DrawingUtils.currentTool = pencilString
        val selectedColor = "#0000FF"
        val unselectedColor = "#FFFFFF"
        selectionColors.clear()
        selectionColors["CBCB28"] = ClientInfo.userId
        selectionColors["0000FF"] = null
        selectionColors["00FF00"] = null
        selectionColors["0000FF"] = null
        DrawingUtils.primaryColor = black
        DrawingUtils.secondaryColor = none
        val usersList = ArrayList<User>()


        val data = intent.extras!!.getString("drawingInformation")
        drawingID = intent.extras!!.getInt("drawingID")
        val allDrawingInformation = AllDrawingInformation().fromJson(data!!)
        //primaryColor.setBackgroundColor(Color.parseColor("#000000"))
        //secondaryColor.setBackgroundColor(Color.parseColor("#FFFFFF"))
        /*=======Users and teams fragment=======*/
        for(userId in allDrawingInformation.activeUsers){
            for(userInformation in ClientInfo.usersList.userList){
                if(userId.userId == userInformation.id){
                    usersList.add(userInformation)
                    break
                }
            }
            for(color in selectionColors){
                if(color.value == null){
                    color.setValue(userId.userId)
                    break
                }
            }
        }

        val usersFragmentTransaction = supportFragmentManager.beginTransaction()
        //don't build
        val usersAndTeamsFragment = UsersAndTeamsFragment(false)
        usersAndTeamsFragment.setColorsMap(selectionColors)
        usersAndTeamsFragment.setUsersList(usersList)
        usersFragmentTransaction.replace(R.id.usersAndTeamsFrameDrawingPage,
            usersAndTeamsFragment).commit()


        socket.on("newJoinToDrawing"){ args->
            if(args[0]!= null){
                val newJoinData = args[0] as String
                val newJoinUser = ActiveUser().fromJson(newJoinData)
                if(newJoinUser.drawingId == drawingID){
                    var newJoinUserInformation = User()
                    for(existingUser in ClientInfo.usersList.userList){
                        if(existingUser.id == newJoinUser.userId){
                             newJoinUserInformation = existingUser
                             break
                        }
                    }
                    for(color in selectionColors){
                        if(color.value == null){
                            color.setValue(newJoinUser.userId)
                            break
                        }
                    }
                    usersAndTeamsFragment.setColorsMap(selectionColors)
                    usersList.add(newJoinUserInformation)
                    usersAndTeamsFragment.setUsersList(usersList)
                }
            }
        }

        socket.on("userLeftDrawing"){args ->
            if(args[0] != null){
                val userLeftData = args[0] as String
                val userLeft = ActiveUser().fromJson(userLeftData)
                if(userLeft.drawingId == drawingID){
                    var i = 0
                    for(existingUsers in usersList){
                        if(existingUsers.id == userLeft.userId){
                            break
                        }
                        i++
                    }
                    for(color in selectionColors){
                        if(color.value == userLeft.userId){
                            color.setValue(null)
                            break
                        }
                    }
                    usersList.removeAt(i)
                    usersAndTeamsFragment.setColorsMap(selectionColors)
                    usersAndTeamsFragment.setUsersList(usersList)
                }
            }
        }

        socket.on("userUpdate"){ args ->
            if(args[0]!= null){
                val userUpdated = User().fromJson(args[0] as String)
                var exist = false
                var i = 0
                for(existingUser in usersList){
                    println(usersList.size)
                    if(existingUser.id == userUpdated.id){
                        exist = true
                        break
                    }
                    i++
                }
                if(exist){
                    usersList.removeAt(i)
                    usersList.add(i, userUpdated)
                    usersAndTeamsFragment.setUsersList(usersList)
                }
            }
        }

        /*=======================================*/
        val params: ViewGroup.LayoutParams = fl_drawing_view_container.getLayoutParams()
        //Button new width
        //Button new width
        drawingRelatedInformation = allDrawingInformation.drawing
        nom.text = drawingRelatedInformation!!.name
        pencil.setBackgroundColor(Color.parseColor(selectedColor))
        canvas = CanvasView(drawingID!!,this)
        canvas!!.parseExistingDrawings(drawingRelatedInformation!!.contents)
        params.width= drawingRelatedInformation!!.width!!
        params.height= drawingRelatedInformation!!.height!!

        fl_drawing_view_container.setLayoutParams(params)
        canvas!!.setBackgroundColor(
            Color.parseColor("#ff${drawingRelatedInformation!!.bgColor}"))
        fl_drawing_view_container.addView(canvas)
        socket.on("drawingToClient"){ args ->
            if(args[0] != null){
                val drawingData = args[0] as String
                val dataTransformed = Gson().fromJson(drawingData, ContentDrawingSocket::class.java)
                if(dataTransformed.drawingId == drawingID){
                    canvas!!.onReceivedDrawing(dataTransformed)
                }
            }
        }
        socket.on("drawingContentCreated"){ args ->
            if(args[0] != null){
                val contentID = args[0] as String
                canvas!!.receiveContentID(contentID)
            }
        }
        pencil.setOnClickListener {
            DrawingUtils.currentTool = pencilString
            pencil.setBackgroundColor(Color.parseColor(selectedColor))
            rectangle.setBackgroundColor(Color.parseColor(unselectedColor))
            ellipse.setBackgroundColor(Color.parseColor(unselectedColor))
            selection.setBackgroundColor(Color.parseColor(unselectedColor))
        }

        rectangle.setOnClickListener {
            DrawingUtils.currentTool = rectString
            pencil.setBackgroundColor(Color.parseColor(unselectedColor))
            rectangle.setBackgroundColor(Color.parseColor(selectedColor))
            ellipse.setBackgroundColor(Color.parseColor(unselectedColor))
            selection.setBackgroundColor(Color.parseColor(unselectedColor))
        }

        selection.setOnClickListener {
            DrawingUtils.currentTool = selectionString
            pencil.setBackgroundColor(Color.parseColor(unselectedColor))
            rectangle.setBackgroundColor(Color.parseColor(unselectedColor))
            ellipse.setBackgroundColor(Color.parseColor(unselectedColor))
            selection.setBackgroundColor(Color.parseColor(selectedColor))
        }

        ellipse.setOnClickListener {
            DrawingUtils.currentTool = ellipseString
            pencil.setBackgroundColor(Color.parseColor(unselectedColor))
            rectangle.setBackgroundColor(Color.parseColor(unselectedColor))
            ellipse.setBackgroundColor(Color.parseColor(selectedColor))
            selection.setBackgroundColor(Color.parseColor(unselectedColor))
        }
        primaryColor.setOnClickListener {
            ColorPickerPopup.Builder(this).initialColor(Color.BLACK)
                .enableBrightness(true)
                .enableAlpha(true)
                .okTitle("Choisir")
                .cancelTitle("Annuler")
                .showIndicator(true)
                .showValue(true)
                .build()
                .show(it, ColorPicker(primaryColor, DrawingUtils.primaryColor, canvas!!))
        }

        transparent.setOnCheckedChangeListener { buttonView, isChecked ->
            DrawingUtils.secondaryColor = none
            canvas!!.updateToolSecondaryColor()
        }

        secondaryColor.setOnClickListener {
            transparent.isSelected = false
            transparent.isChecked = false
            ColorPickerPopup.Builder(this)
                .enableBrightness(true)
                .okTitle("Choisir")
                .enableAlpha(true)
                .cancelTitle("Annuler")
                .showIndicator(true)
                .showValue(true)
                .build()
                .show(it, ColorPicker(secondaryColor, "secondary", canvas!!))
        }
        thickness.value = DrawingUtils.thickness.toFloat()
        thickness.addOnChangeListener { slider, value, fromUser ->
            DrawingUtils.thickness = value.toInt()
            canvas!!.updateToolThickness()
        }
        delete.setOnClickListener {
            canvas!!.deleteTool()
        }


        chatRoomExists = ChatRooms.chatRooNames.contains(drawingRelatedInformation!!.name!!)

        if(!chatRoomExists){
            ChatRooms.chatRooNames.add(drawingRelatedInformation!!.name!!)
        }

        val chatDialog = ChatDialog(this, drawingRelatedInformation!!.name!!)
        ChatRooms.chats[drawingRelatedInformation!!.name!!] =
            allDrawingInformation.chatHistoryList!!
        //chatDialog.show(supportFragmentManager, ChatDialog.TAG)
        //chatDialog.dismiss()
        chatDrawing.setOnClickListener {
            chatDialog.show(supportFragmentManager, ChatDialog.TAG)
        }


        SocketHandler.getChatSocket().on("msgToClient"){ args ->
            if(args[0] != null){
                val messageData = args[0] as String
                val messageFromServer = ClientMessage().fromJson(messageData)
                val roomName = messageFromServer.roomName
                try{
                    chatDialog.chatRoomsFragmentMap[roomName]!!.setMessage(ChatRooms.chats[roomName]!!)
                }
                catch(e: Exception){}
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
    }

    override fun onBackPressed() {
        if(canvas != null){
            canvas!!.unselectAllChildren()
        }
        if(!chatRoomExists){
            ChatRooms.chats.remove(drawingRelatedInformation!!.name)
            var i = 0

            for(room in ChatRooms.chatRooNames){
                if(room == drawingRelatedInformation!!.name){
                    break
                }
                i++
            }
            ChatRooms.chatRooNames.removeAt(i)
        }

        leaveDrawing()
        super.onBackPressed()

    }
    override fun onPause(){
        if(canvas != null){
            canvas!!.unselectAllChildren()
        }
        super.onPause()
    }

    private fun leaveDrawing(){
        val leaveDrawing = LeaveDrawingDto(drawingID!!, ClientInfo.userId)
        socket.emit("leaveDrawing", leaveDrawing.toJson())
        //finish()
    }

    private class ColorPicker(var button: View, var string: String, var canvas: CanvasView):
        ColorPickerPopup.ColorPickerObserver() {
        override fun onColorPicked(color: Int){
            button.setBackgroundColor(color)
            val a = Color.alpha(color)
            val r = Color.red(color)
            val g = Color.green(color)
            val b = Color.blue(color)
            val colorString = String.format(Locale.getDefault(), "%02X%02X%02X%02X",r, g, b, a)
            if(string == "secondary"){
                DrawingUtils.secondaryColor = "#$colorString"
                canvas.updateToolSecondaryColor()
            }
            else{
                DrawingUtils.primaryColor = "#$colorString"
                canvas.updateToolPrimaryColor()
            }

        }
    }
}

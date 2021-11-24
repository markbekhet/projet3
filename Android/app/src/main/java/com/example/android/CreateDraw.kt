package com.example.android

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import kotlinx.android.synthetic.main.colorpicker.*
import kotlinx.android.synthetic.main.colorpicker.colorA
import kotlinx.android.synthetic.main.colorpicker.strColor
import kotlinx.android.synthetic.main.createdraw.*
import android.widget.*
import androidx.core.widget.doAfterTextChanged
import com.example.android.canvas.*
import com.example.android.chat.ChatDialog
import com.example.android.chat.ChatRooms
import com.example.android.chat.ClientMessage
import com.example.android.client.ClientInfo
import com.example.android.client.ClientService
import kotlinx.android.synthetic.main.chatfragment.view.*
import kotlinx.android.synthetic.main.dessin.*
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import okhttp3.ResponseBody
import retrofit2.Response
import top.defaults.colorpicker.ColorPickerPopup
import java.util.*
import kotlin.collections.ArrayList

var newDrawing = DrawingInformation(color="FFFFFF")
class CreateDraw : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        lateinit var option: Spinner
        lateinit var result: TextView
        lateinit var switch: Switch
        val clientService = ClientService()
        var color: String = "#FFFFFF"
        super.onCreate(savedInstanceState)
        setContentView(R.layout.createdraw)

        val chatDialog = ChatDialog(this)
        chatCreateDrawing.setOnClickListener {
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

        val ownerPossible = ArrayList<String>()
        for(item in ClientInfo.possibleOwners){
            val itemValue = item.value
            ownerPossible.add(itemValue.second)
        }

        var ownerPositionSelected = 0
        ownerOptions.adapter = ArrayAdapter(this, android.R.layout.simple_list_item_1,
            ownerPossible)

        ownerOptions.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(p0: AdapterView<*>?, p1: View?, p2: Int, p3: Long) {
                ownerPositionSelected = p2
            }

            @SuppressLint("SetTextI18n")
            override fun onNothingSelected(p0: AdapterView<*>?) {

            }
        }

        //switch=findViewById(R.id.visible) as Switch
        option = findViewById(R.id.sp_option) as Spinner
        result = findViewById(R.id.result) as TextView

        val options = arrayOf("public", "protegé", "privé")
        option.adapter = ArrayAdapter<String>(this, android.R.layout.simple_list_item_1, options)
        option.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(p0: AdapterView<*>?, p1: View?, p2: Int, p3: Long) {
                result.text = options[p2]
                newDrawing.visibility = p2
                if (p2 == 1) {
                    drawingPassword.visibility = View.VISIBLE
                } else {
                    drawingPassword.visibility = View.INVISIBLE
                }
            }

            @SuppressLint("SetTextI18n")
            override fun onNothingSelected(p0: AdapterView<*>?) {
                result.text = options[0]
                newDrawing.visibility = 0
            }
        }


        /*btnColorPicker.setOnClickListener {
            colorSelector.visibility = View.VISIBLE
        }*/


        btnColorSelected.setOnClickListener {
            //colorSelector.visibility = View.VISIBLE
            ColorPickerPopup.Builder(this)
                .enableBrightness(true)
                .okTitle("Choisir")
                .enableAlpha(false)
                .cancelTitle("Annuler")
                .showIndicator(true)
                .showValue(true)
                .build()
                .show(ColorPicker(btnColorSelected))
        }

        drawingName.doAfterTextChanged {
            if (!isNotBlank()) {
                create.isEnabled = false
                create.isClickable = false
            } else {
                create.isEnabled = true
                create.isClickable = true
            }
            error.text = ""
        }

        create?.setOnClickListener() {
            var canProcessQuery = true
            if (newDrawing.visibility == Visibility.protectedVisibility.int) {
                if (drawingPassword.text.isBlank() || drawingPassword.text.isEmpty()) {
                    canProcessQuery = false
                    error.text = "Le mot de passe est obligatoire et" +
                        " ne peut pas être composé d'espace quand le dessin est protégé"
                } else {
                    newDrawing.password = drawingPassword.text.toString()
                }
            }
            else{
                newDrawing.password = null
            }

            newDrawing.height = 900
            newDrawing.width = 900
            newDrawing.name = drawingName.text.toString()

            // in case of an error
            try{
                newDrawing.ownerId = ClientInfo.possibleOwners[ownerPositionSelected]!!.first
            } catch(e: Exception){
                newDrawing.ownerId = ClientInfo.userId
            }

            newDrawing.color = btnColorSelected.tooltipText as String?
            println(newDrawing.color)
            drawingName.text.clear()
            btnColorSelected.tooltipText = "FFFFFF"
            btnColorSelected.setBackgroundColor(Color.WHITE)
            if (canProcessQuery) {
                var response: Response<ResponseBody>? = null
                runBlocking {
                    async {
                        launch {
                            response = clientService.createDrawing(newDrawing)
                        }
                    }
                }
                if (response!!.isSuccessful) {
                    val drawingID = response?.body()!!.string().toInt()
                    //join the drawing
                    val joinRequest = JoinDrawingDto(drawingID, ClientInfo.userId,
                        password = newDrawing.password)


                    var i = 0
                    SocketHandler.getChatSocket().emit("joinDrawing", joinRequest.toJson())
                    SocketHandler.getChatSocket().on("drawingInformations"){ args ->
                        if(args[0]!=null && i == 0){
                            val data = args[0] as String
                            val bundle = Bundle()
                            bundle.putString("drawingInformation", data)
                            bundle.putInt("drawingID", drawingID)
                            startActivity(Intent(this, Drawing::class.java).putExtras(bundle))
                            i++
                            finish()
                        }
                    }
                } else {
                    error.text = response!!.errorBody()!!.string()
                }

            }
        }

        /*strColor.addTextChangedListener(object : TextWatcher {

            override fun afterTextChanged(s: Editable) {
                if (s.length == 6){
                    colorA.progress = 255
                    colorR.progress = Integer.parseInt(s.substring(0..1), 16)
                    colorG.progress = Integer.parseInt(s.substring(2..3), 16)
                    colorB.progress = Integer.parseInt(s.substring(4..5), 16)
                } else if (s.length == 8){
                    colorA.progress = Integer.parseInt(s.substring(0..1), 16)
                    colorR.progress = Integer.parseInt(s.substring(2..3), 16)
                    colorG.progress = Integer.parseInt(s.substring(4..5), 16)
                    colorB.progress = Integer.parseInt(s.substring(6..7), 16)
                }
            }

            override fun beforeTextChanged(s: CharSequence, start: Int,
                                           count: Int, after: Int) {
            }

            override fun onTextChanged(s: CharSequence, start: Int,
                                       before: Int, count: Int) {

            }
        })*/

        /*colorA.max = 255
        colorA.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onStopTrackingTouch(seekBar: SeekBar) {}
            override fun onStartTrackingTouch(seekBar: SeekBar) {}
            override fun onProgressChanged(seekBar: SeekBar, progress: Int,
                                           fromUser: Boolean) {
                val colorStr = getColorString()
                strColor.setText(colorStr.replace("#","").toUpperCase())
                btnColorPreview.setBackgroundColor(Color.parseColor(colorStr))
                newDrawing.color = colorStr
            }
        })

        colorR.max = 255
        colorR.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onStopTrackingTouch(seekBar: SeekBar) {}
            override fun onStartTrackingTouch(seekBar: SeekBar) {}
            override fun onProgressChanged(seekBar: SeekBar, progress: Int,
                                           fromUser: Boolean) {
                val colorStr = getColorString()
                newDrawing.color = colorStr
                strColor.setText(colorStr.replace("#","").toUpperCase())
                btnColorPreview.setBackgroundColor(Color.parseColor(colorStr))
            }
        })

        colorG.max = 255
        colorG.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onStopTrackingTouch(seekBar: SeekBar) {}
            override fun onStartTrackingTouch(seekBar: SeekBar) {}
            override fun onProgressChanged(seekBar: SeekBar, progress: Int,
                                           fromUser: Boolean) {
                val colorStr = getColorString()
                newDrawing.color = colorStr
                strColor.setText(colorStr.replace("#","").toUpperCase())
                btnColorPreview.setBackgroundColor(Color.parseColor(colorStr))
            }
        })

        colorB.max = 255
        colorB.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onStopTrackingTouch(seekBar: SeekBar) {}
            override fun onStartTrackingTouch(seekBar: SeekBar) {}
            override fun onProgressChanged(seekBar: SeekBar, progress: Int,
                                           fromUser: Boolean) {
                val colorStr = getColorString()
                strColor.setText(colorStr.replace("#","").toUpperCase())
                btnColorPreview.setBackgroundColor(Color.parseColor(colorStr))
            }
        })

        colorCancelBtn.setOnClickListener {
            colorSelector.visibility = View.GONE
        }

        colorOkBtn.setOnClickListener {
           color = getColorString()
            btnColorSelected.setBackgroundColor(Color.parseColor(color))
            colorSelector.visibility = View.GONE
        }
    }
    fun getColorString(): String {
        var a = Integer.toHexString(((255*colorA.progress)/colorA.max))
        if(a.length==1) a = "0"+a
        var r = Integer.toHexString(((255*colorR.progress)/colorR.max))
        if(r.length==1) r = "0"+r
        var g = Integer.toHexString(((255*colorG.progress)/colorG.max))
        if(g.length==1) g = "0"+g
        var b = Integer.toHexString(((255*colorB.progress)/colorB.max))
        if(b.length==1) b = "0"+b
        return "#$r$g$b$a"
    }*/
    }
    private fun isNotBlank(): Boolean{
        if(drawingName.text.isBlank()){
            return false
        }
        return true
    }

    private class ColorPicker(var button: View):ColorPickerPopup.ColorPickerObserver() {
        override fun onColorPicked(color: Int) {
            button.setBackgroundColor(color)
            val r = Color.red(color)
            val g = Color.green(color)
            val b = Color.blue(color)
            button.tooltipText = String.format(Locale.getDefault(), "%02X%02X%02X", r, g, b)

        }

    }
}




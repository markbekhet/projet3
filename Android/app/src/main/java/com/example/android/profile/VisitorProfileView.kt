package com.example.android.profile

import android.graphics.BitmapFactory
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Base64
import com.bumptech.glide.Glide
import com.example.android.R
import kotlinx.android.synthetic.main.avatar.*
import kotlinx.android.synthetic.main.avatar.img_save
import com.example.android.chat.ChatDialog
import com.example.android.client.UserProfileInformation
import com.example.android.client.clientStatusFroInt
import kotlinx.android.synthetic.main.activity_vistor_profile_view.*

class VisitorProfileView : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_vistor_profile_view)
        val bundle = intent.extras
        val data = bundle!!.getString("profileInformation")
        val dataForm = UserProfileInformation().fromJson(data)
        nicknameForeignValue.text = dataForm.pseudo
        foreignStatusValue.text = clientStatusFroInt(dataForm.status!!).string

        val chatDialog = ChatDialog(this)
        showChatVisitorProfile.setOnClickListener {
            chatDialog.show(supportFragmentManager, ChatDialog.TAG)
        }

    }
}

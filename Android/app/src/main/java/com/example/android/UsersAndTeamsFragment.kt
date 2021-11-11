package com.example.android

import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.android.client.ClientInfo
import com.example.android.client.User
import com.example.android.client.UserProfileRequest
import com.example.android.client.clientStatusFroInt
import com.example.android.profile.OwnProfile
import com.example.android.profile.VisitorProfileView
import com.example.android.team.TeamActivity
import com.example.android.team.TeamGeneralInformation
import com.xwray.groupie.GroupAdapter
import com.xwray.groupie.GroupieViewHolder
import com.xwray.groupie.Item
import kotlinx.android.synthetic.main.connection_disconnection_item.view.*
import kotlinx.android.synthetic.main.fragment_users_and_teams.*
import kotlinx.android.synthetic.main.user_item.view.*

// TODO: Rename parameter arguments, choose names that match
// the fragment initialization parameters, e.g. ARG_ITEM_NUMBER
private const val ARG_PARAM1 = "param1"
private const val ARG_PARAM2 = "param2"

/**
 * A simple [Fragment] subclass.
 * Use the [UsersAndTeamsFragment.newInstance] factory method to
 * create an instance of this fragment.
 */
class UsersAndTeamsFragment() : Fragment() {
    private var usersAdapter : GroupAdapter<GroupieViewHolder>? = null
    private var teamsAdapter: GroupAdapter<GroupieViewHolder>?= null
    private var usersList: ArrayList<User>?= null
    private var teamList: ArrayList<TeamGeneralInformation>?= null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        /*arguments?.let {
            param1 = it.getString(ARG_PARAM1)
            param2 = it.getString(ARG_PARAM2)
        }*/
    }

    fun startTeamActivity(){
        startActivity(Intent(context, TeamActivity::class.java))
    }

    fun startUserActivity(userId: String){
        val joinRequest = UserProfileRequest(ClientInfo.userId, userId)
        SocketHandler.getChatSocket().emit("getUserProfileRequest", joinRequest.toJson())
        var i = 0
        SocketHandler.getChatSocket().on("profileToClient"){ args ->
            if(args[0]!=null && i==0){
                val data = args[0] as String
                val bundle = Bundle()
                val intent = Intent(context, VisitorProfileView::class.java)
                bundle.putString("profileInformation", data)
                intent.putExtras(bundle)
                startActivity(intent)
                i++
            }
        }
    }
    fun setTeamsList(teamsList:ArrayList<TeamGeneralInformation>){
        teamList = teamsList
    }
    fun setUsersList(usersList: ArrayList<User>){
        this.usersList = usersList
        updateUsersRecycleView()
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.fragment_users_and_teams, container, false)
        // Inflate the layout for this fragment
        return view
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val usersLayoutManager = LinearLayoutManager(context)
        usersLayoutManager.orientation = LinearLayoutManager.VERTICAL
        usersRecycleView?.layoutManager = usersLayoutManager
        updateUsersRecycleView()
    }

    fun updateUsersRecycleView(){
        if(usersList != null){
            usersAdapter = GroupAdapter<GroupieViewHolder>()
            for(user in usersList!!){
                if(user.id != ClientInfo.userId){
                    val newUserItem = UserItem(this)
                    newUserItem.set(user)
                    usersAdapter?.add(newUserItem)
                }
            }
            activity?.runOnUiThread{
                usersRecycleView.adapter = usersAdapter
            }
        }
    }


    companion object {
        /**
         * Use this factory method to create a new instance of
         * this fragment using the provided parameters.
         *
         * @param param1 Parameter 1.
         * @param param2 Parameter 2.
         * @return A new instance of fragment UsersAndTeamsFragment.
         */
        // TODO: Rename and change types and number of parameters
        @JvmStatic
        fun newInstance(param1: String, param2: String) =
            UsersAndTeamsFragment().apply {
                arguments = Bundle().apply {
                    putString(ARG_PARAM1, param1)
                    putString(ARG_PARAM2, param2)
                }
            }
    }
}

class UserItem(var fragment:UsersAndTeamsFragment) : Item<GroupieViewHolder>() {

    var username: String? =null
    var id: String?= null
    var status: String?= null
    override fun bind(viewHolder: GroupieViewHolder, position: Int) {
        viewHolder.itemView.foreignUserName.text = username
        viewHolder.itemView.foreignUserStatus.text = status
        viewHolder.itemView.foreignUserName.setOnClickListener {
            fragment.startUserActivity(id!!)
        }
    }

    override fun getLayout(): Int {
        return R.layout.user_item
    }

    fun set(user:User){
        this.username = user.pseudo
        this.id = user.id
        this.status = clientStatusFroInt(user.status!!).string
    }

}



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
import com.example.android.canvas.DrawingStatus
import com.example.android.canvas.Visibility
import com.example.android.client.ClientInfo
import com.example.android.client.User
import com.example.android.client.UserProfileRequest
import com.example.android.client.clientStatusFroInt
import com.example.android.profile.OwnProfile
import com.example.android.profile.VisitorProfileView
import com.example.android.team.JoinTeamDto
import com.example.android.team.TeamActivity
import com.example.android.team.TeamGeneralInformation
import com.example.android.team.TeamUtils
import com.xwray.groupie.GroupAdapter
import com.xwray.groupie.GroupieViewHolder
import com.xwray.groupie.Item
import kotlinx.android.synthetic.main.connection_disconnection_item.view.*
import kotlinx.android.synthetic.main.fragment_users_and_teams.*
import kotlinx.android.synthetic.main.team_item.view.*
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
    private var teamsList: ArrayList<TeamGeneralInformation>?= null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        /*arguments?.let {
            param1 = it.getString(ARG_PARAM1)
            param2 = it.getString(ARG_PARAM2)
        }*/
    }

    fun startTeamActivity(createTeamDto: TeamGeneralInformation){
        // support negative case where the user cannot join a team just a Toast
        TeamUtils.currentTeam = createTeamDto
        val joinTeam = JoinTeamDto(
            teamName = createTeamDto.name,
            userId = createTeamDto.ownerId,
            password = createTeamDto.password)
        var i = 0
        SocketHandler.getChatSocket().emit("joinTeam", joinTeam.toJson())
        SocketHandler.getChatSocket().on("teamInformations"){ args ->
            if(args[0]!= null && i==0){
                val data = args[0] as String
                val bundle = Bundle()
                bundle.putString("teamInformation", data)
                //ToComplete: Collect the rest of information concerning
                // the team like the gallery and the list of users
                startActivity(Intent(context, TeamActivity::class.java).putExtras(bundle))
                i++
            }
        }
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
        this.teamsList = teamsList
        updateTeamsRecycleView()
    }
    fun setUsersList(usersList: ArrayList<User>){
        this.usersList = usersList
        updateUsersRecycleView()
    }

    fun updateUserListInformation(user: User){
        if(usersList != null){
            for(existingUser in usersList!!){
                if(existingUser.id == user.id){
                    usersList!!.remove(existingUser)
                }
            }
            usersList!!.add(user)
        }
        updateUsersRecycleView()
    }

    fun updateTeamsListInformation(team: TeamGeneralInformation){
        if(teamsList != null){
            for(existingTeam in teamsList!!){
                if(existingTeam.id == team.id){
                    teamsList!!.remove(existingTeam)
                }
            }
            teamsList!!.add(team)
        }
        updateTeamsRecycleView()
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
        val teamsLayoutManager = LinearLayoutManager(context)
        teamsLayoutManager.orientation = LinearLayoutManager.VERTICAL
        teamsRecycleView?.layoutManager = teamsLayoutManager
        updateTeamsRecycleView()

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

    fun updateTeamsRecycleView(){
        if(teamsList != null){
            teamsAdapter = GroupAdapter<GroupieViewHolder>()
            for(team in teamsList!!){
                val newTeamItem = TeamItem(this)
                newTeamItem.set(team)
                teamsAdapter?.add(newTeamItem)
            }
            activity?.runOnUiThread{
                teamsRecycleView.adapter = teamsAdapter
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

class TeamItem(var fragment: UsersAndTeamsFragment): Item<GroupieViewHolder>(){

    var team: TeamGeneralInformation?= null
    override fun bind(viewHolder: GroupieViewHolder, position: Int) {
        viewHolder.itemView.teamName.text = team!!.name
        //the block to join a team
        viewHolder.itemView.teamName.setOnClickListener {
            if(team!!.visibility != Visibility.protectedVisibility.int){
                fragment.startTeamActivity(team!!)
            }
        }
        if(team!!.ownerId != ClientInfo.userId){
            viewHolder.itemView.deleteBin.visibility = View.INVISIBLE
            viewHolder.itemView.deleteBin.isClickable = false
            viewHolder.itemView.deleteBin.isEnabled = false
        }
        else{
            viewHolder.itemView.deleteBin.visibility = View.VISIBLE
            viewHolder.itemView.deleteBin.isClickable = true
            viewHolder.itemView.deleteBin.isEnabled = true
            viewHolder.itemView.deleteBin.setOnClickListener {
                // launch request to delete the drawing
            }
        }

    }

    override fun getLayout(): Int {
        return R.layout.team_item
    }
    fun set(team: TeamGeneralInformation){
        this.team = team
    }
}



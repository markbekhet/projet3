package com.example.android

import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import android.graphics.Color
import android.os.Bundle
import android.util.Base64
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.android.canvas.DrawingStatus
import com.example.android.canvas.Visibility
import com.example.android.client.*
import com.example.android.profile.OwnProfile
import com.example.android.profile.VisitorProfileView
import com.example.android.team.*
import com.xwray.groupie.GroupAdapter
import com.xwray.groupie.GroupieViewHolder
import com.xwray.groupie.Item
import kotlinx.android.synthetic.main.avatar.*
import kotlinx.android.synthetic.main.connection_disconnection_item.view.*
import kotlinx.android.synthetic.main.fragment_users_and_teams.*
import kotlinx.android.synthetic.main.team_item.view.*
import kotlinx.android.synthetic.main.user_item.view.*
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import okhttp3.ResponseBody
import retrofit2.Response

// TODO: Rename parameter arguments, choose names that match
// the fragment initialization parameters, e.g. ARG_ITEM_NUMBER
private const val ARG_PARAM1 = "param1"
private const val ARG_PARAM2 = "param2"

/**
 * A simple [Fragment] subclass.
 * Use the [UsersAndTeamsFragment.newInstance] factory method to
 * create an instance of this fragment.
 */
class UsersAndTeamsFragment(var showTeams:Boolean=true) : Fragment() {
    private var usersAdapter : GroupAdapter<GroupieViewHolder>? = null
    private var teamsAdapter: GroupAdapter<GroupieViewHolder>?= null
    private var usersList= ArrayList<User>()
    private var clientService = ClientService()
    private var colorsMap: HashMap<String, String?>? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        /*arguments?.let {
            param1 = it.getString(ARG_PARAM1)
            param2 = it.getString(ARG_PARAM2)
        }*/
    }

    fun startTeamActivity(createTeamDto: TeamGeneralInformation){
        // support negative case where the user cannot join a team just a Toast
        val joinTeam = JoinTeamDto(
            teamName = createTeamDto.name,
            userId = ClientInfo.userId,
            password = createTeamDto.password)
        var i = 0
        SocketHandler.getChatSocket().emit("joinTeam", joinTeam.toJson())
        SocketHandler.getChatSocket().on("teamInformations"){ args ->
            if(args[0]!= null && i==0){
                val data = args[0] as String
                val bundle = Bundle()
                bundle.putString("teamInformation", data)
                bundle.putString("teamGeneralInformation", createTeamDto.toJson())
                startActivity(Intent(context, TeamActivity::class.java).putExtras(bundle))
                i++
            }
        }
        SocketHandler.getChatSocket().on("cantJoinTeam"){ args ->
            if(args[0]!= null){
                val data = args[0] as String
                val cantJoin = CantJoin().fromJson(data)
                requireActivity().runOnUiThread{
                    Toast.makeText(context, cantJoin.message, Toast.LENGTH_SHORT).show()
                }
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
    fun setTeamsList(){
        updateTeamsRecycleView()
    }
    fun setUsersList(usersList: ArrayList<User>) {
        this.usersList = usersList
        updateUsersRecycleView()
    }

    fun updateUserListInformation(user: User){

        var exist = false
        var i = 0
        for(existingUser in usersList){
            if(existingUser.id == user.id){
                exist = true
                break
            }
            i++
        }
        if(exist){
            usersList.removeAt(i)
        }
        usersList.add(user)
        updateUsersRecycleView()
    }

    fun setColorsMap(colorsMap: HashMap<String, String?>){
        this.colorsMap = colorsMap
    }

    fun addTeam(team: TeamGeneralInformation){
        var alreadyExist = false
        for(existingTeam in ClientInfo.teamsList.teamList){
            if(existingTeam.id == team.id){
                alreadyExist = true
            }
        }
        if(!alreadyExist){
            ClientInfo.teamsList.teamList.add(team)
        }
        updateTeamsRecycleView()
    }

    fun removeTeam(team: TeamGeneralInformation){
        var i = 0
        for(existingTeam in ClientInfo.teamsList.teamList!!){
            if(existingTeam.id == team.id){
                break
            }
            i++
        }
        ClientInfo.teamsList.teamList!!.removeAt(i)
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
        if(showTeams){
            val teamsLayoutManager = LinearLayoutManager(context)
            teamsLayoutManager.orientation = LinearLayoutManager.VERTICAL
            teamsRecycleView?.layoutManager = teamsLayoutManager
            updateTeamsRecycleView()
        }
        else{
          teamsLabelFragment.visibility = View.INVISIBLE
          teamsRecycleView.visibility = View.INVISIBLE
        }

        val usersLayoutManager = LinearLayoutManager(context)
        usersLayoutManager.orientation = LinearLayoutManager.VERTICAL
        usersRecycleView?.layoutManager = usersLayoutManager
        updateUsersRecycleView()
    }

    fun startJoinProtectedActivity(data: String){
        val bundle = Bundle()
        bundle.putString("teamInformation",data)
        startActivity(Intent(context, JoinProtected::class.java).putExtras(bundle))
    }

    fun updateUsersRecycleView(){
        usersAdapter = GroupAdapter<GroupieViewHolder>()
        for(user in usersList){
            if(user.id != ClientInfo.userId){
                val newUserItem = UserItem(this)
                var color = "#FFFFFFFF"
                if(colorsMap != null){
                    for(aColor in colorsMap!!){
                        if(aColor.value == user.id){
                            color = aColor.key
                            break
                        }
                    }
                    color = "#FF$color"
                }
                newUserItem.set(user, color)
                usersAdapter?.add(newUserItem)
            }
            else{
                ClientInfo.username = user.pseudo
                val firstPair = Pair<String, String>(ClientInfo.userId, ClientInfo.username!!)
                ClientInfo.possibleOwners[0]= firstPair

            }
        }
        activity?.runOnUiThread{
            usersRecycleView.adapter = usersAdapter
        }
    }

    fun updateTeamsRecycleView(){
        teamsAdapter = GroupAdapter<GroupieViewHolder>()
        for(team in ClientInfo.teamsList.teamList!!){
            val newTeamItem = TeamItem(clientService,this)
            newTeamItem.set(team)
            teamsAdapter?.add(newTeamItem)
        }
        activity?.runOnUiThread{
            teamsRecycleView.adapter = teamsAdapter
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

    var avatar: String?= null
    var username: String? =null
    var id: String?= null
    var status: String?= null
    var color: String = "#FFFFFFFF"
    override fun bind(viewHolder: GroupieViewHolder, position: Int) {
        viewHolder.itemView.foreignUserName.text = username
        viewHolder.itemView.foreignUserStatus.text = status
        viewHolder.itemView.foreignUserName.setOnClickListener {
            fragment.startUserActivity(id!!)
        }
        viewHolder.itemView.userColor.setBackgroundColor(
            Color.parseColor(color))

        val decodedModifiedString = Base64.decode(
            avatar, Base64.DEFAULT)
        val decodedModifiedByte = BitmapFactory.decodeByteArray(
            decodedModifiedString,0, decodedModifiedString.size)
        Glide.with(fragment.requireActivity()).load(decodedModifiedByte)
            .fitCenter().into(viewHolder.itemView.avatarUserFragment)
    }

    override fun getLayout(): Int {
        return R.layout.user_item
    }

    fun set(user:User, color: String){
        this.username = user.pseudo
        this.id = user.id
        this.status = clientStatusFroInt(user.status!!).string
        this.color = color
        this.avatar = user.avatar
    }

}

class TeamItem(var clientService: ClientService,
               var fragment: UsersAndTeamsFragment): Item<GroupieViewHolder>(){
    var team: TeamGeneralInformation?= null
    override fun bind(viewHolder: GroupieViewHolder, position: Int) {
        viewHolder.itemView.teamName.text = team!!.name
        //the block to join a team
        viewHolder.itemView.teamName.setOnClickListener {
            if(team!!.visibility != Visibility.protectedVisibility.int){
                fragment.startTeamActivity(team!!)
            }
            else{
                fragment.startJoinProtectedActivity(team!!.toJson())
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
                var response: Response<ResponseBody>? = null
                runBlocking {
                    async{
                       launch{
                            val deleteTeam = DeleteTeamDto(teamId = team!!.id,
                                userId = ClientInfo.userId)
                            response = clientService.deleteTeam(deleteTeam)
                       }
                    }
                }
                if(response!!.isSuccessful){
                    fragment.requireActivity().runOnUiThread{
                        Toast.makeText(fragment.context, "Équipe supprimée avec succès",
                            Toast.LENGTH_SHORT).show()
                    }
                }
                else{
                    val error = CantJoin().fromJson(response!!.errorBody()!!.string())
                    fragment.requireActivity().runOnUiThread{
                        Toast.makeText(fragment.context, error.message,Toast.LENGTH_SHORT).show()
                    }
                }
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



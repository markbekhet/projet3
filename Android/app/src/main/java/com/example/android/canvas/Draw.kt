package com.example.android.canvas

import com.example.android.chat.ClientMessage
import com.example.android.client.ClientInfo
import com.google.gson.Gson

class DrawingInformation (
    var visibility:Int? = null,
    var password: String?= null,
    var ownerId: String?= null,
    var height:Int?= null,
    var width:Int?= null,
    var name:String?= null,
    var color:String? = null){
    fun toJson(): String{
        return Gson().toJson(this)
    }

}

class ReceiveDrawingInformation(
    var id: Int?= null,
    var ownerId: String? = null,
    var bgColor:String?= null,
    var height: Int?= null,
    var width: Int?= null,
    var visibility: Int?= null,
    var name: String?= null,
    var contents: ArrayList<ContentDrawingSocket> = ArrayList<ContentDrawingSocket>(),
    var creationDate: String?=null,
    var nbCollaborators: Int = 0
){
    fun fromJson(json: String): ReceiveDrawingInformation{
        return Gson().fromJson(json, ReceiveDrawingInformation::class.java)
    }

    fun toJson(): String{
        return Gson().toJson(this)
    }
}

class GalleryDrawing(var drawingList: ArrayList<ReceiveDrawingInformation> = ArrayList()){
    fun fromJson(json:String): GalleryDrawing{
        return Gson().fromJson(json, GalleryDrawing::class.java)
    }

    fun removeDrawingsTeam(teamId: String){
        val drawingsToBeRemoved = ArrayList<ReceiveDrawingInformation>()
        for(drawing in drawingList){
            if(drawing.visibility == Visibility.privateVisibility.int
                && drawing.ownerId == teamId){
                drawingsToBeRemoved.add(drawing)
            }
        }
        drawingList.removeAll(drawingsToBeRemoved)
    }

    fun addDrawingsToList(extraDrawings: ArrayList<ReceiveDrawingInformation>){
        // The double for loop is in the case if a team is joint twice
        for(extraDrawing in extraDrawings){
            var exist = false
            for(existingDrawing in drawingList){
                if(existingDrawing.id == extraDrawing.id){
                    exist = true
                    break
                }
                if(!exist){
                    drawingList.add(extraDrawing)
                }
            }
        }
    }

    fun deleteExistingDrawing(deletedDrawing: ReceiveDrawingInformation){
        var i = 0
        var exist = false
        for(drawing in drawingList){
            if(deletedDrawing.id == drawing.id){
                exist = true
                break
            }
            i++
        }
        if(exist){
            drawingList.removeAt(i)
        }
    }

    fun addNewCreatedDrawing(drawing: ReceiveDrawingInformation, id: String){
        var exist = false
        for(existingDrawing in drawingList){
            if(drawing.id == existingDrawing.id){
                exist = true;
                break
            }
        }
        if(!exist){
            if(drawing.visibility == Visibility.privateVisibility.int){
                if(drawing.ownerId == id){
                    drawingList.add(drawing)
                }
            }
            else{
                drawingList.add(drawing)
            }
        }
    }

    fun modifyDrawing(drawingMod: ReceiveDrawingInformation, id:String){
        var i = 0
        var exist = false
        for(existingDrawing in drawingList){
            if(drawingMod.id == existingDrawing.id){
               exist = true
                break
            }
            i++
        }
        if(exist){
            drawingList.removeAt(i)
        }

        if(drawingMod.visibility == Visibility.privateVisibility.int){
            if(drawingMod.ownerId == id){
                drawingList.add(i, drawingMod)
            }
        }else{
            drawingList.add(i, drawingMod)
        }
    }

    fun increaseNbCollaborator(modifiedDrawing: ModifyDrawingDto){
        for(existingDrawing in drawingList){
            if(existingDrawing.id == modifiedDrawing.drawingId){
                existingDrawing.nbCollaborators++
                break
            }
        }
    }

    fun  decreaseNbCollaborator(modifiedDrawing: ModifyDrawingDto){
        for(existingDrawing in drawingList){
            if(existingDrawing.id == modifiedDrawing.drawingId){
                existingDrawing.nbCollaborators--
                break
            }
        }
    }
}
// This class encapsulates all the details needed for the chat,
// drawing informations and connected users for a given drawing
class AllDrawingInformation(
    var drawing: ReceiveDrawingInformation?= null,
    var chatHistoryList: ArrayList<ClientMessage>?=null
){
    fun fromJson(json: String): AllDrawingInformation{
        return Gson().fromJson(json, AllDrawingInformation::class.java)
    }
}

class JoinDrawingDto(var drawingId:Int,
                     var userId: String, var password:String?=null){
    fun toJson(): String{
        return Gson().toJson(this)
    }
}

class LeaveDrawingDto(var drawingId:Int, var userId:String){
    fun toJson(): String{
        return Gson().toJson(this)
    }
}
class DeleteDrawingDt(var drawingId:Int, var userId:String) {
    fun toJson(): String {
        return Gson().toJson(this)
    }
}
class ModifyDrawingDto(
    var drawingId:Int?= null,
    var userId:String?= null,
    var newName: String?= null,
    var newVisibility: Int?= null,
    var password: String?= null)
{
    fun toJson(): String {
        return Gson().toJson(this)
    }

    fun fromJson(json: String): ModifyDrawingDto{
        return Gson().fromJson(json, ModifyDrawingDto::class.java)
    }
}

enum class Visibility(var int: Int){
    publicVisibility(0),
    protectedVisibility(1),
    privateVisibility(2);

    fun getVisibilityFromInt(int:Int): Visibility{
        if(int == 0){
            return publicVisibility
        }else if(int == 1){
            return protectedVisibility
        }
        else{
            return privateVisibility
        }
    }
}

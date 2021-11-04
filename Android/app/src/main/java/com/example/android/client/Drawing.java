package com.example.android.client;

class Drawings {

    // PROPERTIES
    private Number drawingId;
    private visibility visibility;
    private DrawingContent[] contents;
    private String drawingName;
    private String ownerUsername;
    private Number height;
    private  Number width;
    private String ownerEmail;
    private String ownerFirstname;
    private String ownerLastname;


    // CONSTRUCTOR
    public Drawings(Number drawingId, visibility visibility, DrawingContent[] contents,
                    String drawingName,String ownerUsername,Number height,
                    Number width,String ownerEmail,String ownerFirstname,String ownerLastname){
        this.drawingId = drawingId;
        this.visibility = visibility;
        this.contents = contents;
        this.drawingName = drawingName;
        this.ownerUsername = ownerUsername;
        this.height = height;
        this.width = width;
        this.ownerEmail = ownerEmail;
        this.ownerFirstname = ownerFirstname;
        this.ownerLastname = ownerLastname;
    }

}
enum visibility{
    PUBLIC,
    PROTECTED,
    PRIVATE,
}

class Drawing{
    private Number id;
    private String creationDate;
    private String ownerId;
    private visibility visibility;
    private String password;
    private Number height;
    private  Number width;
    private String name;
    private boolean useOwnerPrivateInformation;
    private String bgColor;
    public Drawing(Number id, String creationDate, visibility visibility,
                   String password,Number height,Number width,
                   String name,boolean useOwnerPrivateInformation,String bgColor){
        this.id = id;
        this.creationDate = creationDate;
        this.visibility = visibility;
        this.password = password;
        this.height = height;
        this.width = width;
        this.name = name;
        this.useOwnerPrivateInformation = useOwnerPrivateInformation;
        this.bgColor = bgColor;
    }
}

class DrawingsContent{
    private Drawing[] contents;
    public DrawingsContent(Drawing[] contents) {
    for(Integer i in contents){
        this.contents[i].creationDate=contents[i].creationDate;
        this.contents[i].visibility=contents[i].visibility;
        this.contents[i].password=contents[i].password;
        this.contents[i].height=contents[i].height;
        this.contents[i].name=contents[i].name;
        this.contents[i].useOwnerPrivateInformation=contents[i].useOwnerPrivateInformation;
        this.contents[i].bgColor=contents[i].bgColor;

    }
    }
}

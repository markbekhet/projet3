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

}

class DrawingsContent{

}
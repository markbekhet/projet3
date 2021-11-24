import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Team, TeamCreation, TeamInformations } from '@src/app/models/teamsMeta';
import { TeamVisibilityLevel } from '@src/app/models/VisibilityMeta';
import { BehaviorSubject } from 'rxjs';

const PATH = "http://localhost:3000"

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  activeTeams: BehaviorSubject<Map<string, TeamInformations>> = new BehaviorSubject<Map<string, TeamInformations>>(new Map())
  requestedTeamToJoin: BehaviorSubject<Team> = new BehaviorSubject<Team>({
    name:"",
    visibility: TeamVisibilityLevel.PUBLIC,
    ownerId: "",
    bio: undefined,
    id: "",
  })
  leftTeamId: BehaviorSubject<string> = new BehaviorSubject<string>("");

  constructor(private httpClient: HttpClient) { }

  createTeam(team: TeamCreation){
    return this.httpClient.post<Team>(`${PATH}/collaborationTeam`, team)
  }

  //TODO
  deleteTeam(data: {teamId: string, userId: string}){
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: data
    }
    this.httpClient.delete(`${PATH}/collaborationTeam`, httpOptions).subscribe((res)=>{
      console.log(res);
    },
    (error)=>{
      console.log(`error: ${error.message}`)
    }
    )
  }
}

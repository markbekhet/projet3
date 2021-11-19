import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Team } from '@src/app/models/teamsMeta';
import { BehaviorSubject } from 'rxjs';
//import { Observable } from 'rxjs';

const PATH = "http://localhost:3000"

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  activeTeams: BehaviorSubject<Map<string, Team>> = new BehaviorSubject<Map<string, Team>>(new Map())
  requestedTeamToJoin: BehaviorSubject<Team> = new BehaviorSubject<Team>({})

  constructor(private httpClient: HttpClient) { }

  createTeam(team: Team){
    this.httpClient.post<Team>(`${PATH}/collaborationTeam`, team).subscribe((team)=>{
      if(team) console.log(team)

    },
    (error)=>{
      console.log(`error: ${error.message}`)
    }
    )
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

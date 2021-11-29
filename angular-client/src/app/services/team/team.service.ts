import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Team, TeamCreation, TeamInformations } from '@models/teamsMeta';
import { TeamVisibilityLevel } from '@models/VisibilityMeta';
import { BehaviorSubject } from 'rxjs';

const PATH = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  activeTeams = new BehaviorSubject<Map<string, TeamInformations>>(new Map());

  requestedTeamToJoin = new BehaviorSubject<Team>({
    name: '',
    visibility: TeamVisibilityLevel.PUBLIC,
    ownerId: '',
    bio: undefined,
    id: '',
  });

  leftTeamId = new BehaviorSubject<string>('');

  constructor(private httpClient: HttpClient) {}

  createTeam(team: TeamCreation) {
    return this.httpClient.post<Team>(`${PATH}/collaborationTeam`, team);
  }

  // TODO
  deleteTeam(data: { teamId: string; userId: string }) {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: data,
    };
    return this.httpClient.delete(`${PATH}/collaborationTeam`, httpOptions);
  }
}

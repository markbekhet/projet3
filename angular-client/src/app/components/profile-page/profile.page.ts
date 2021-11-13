import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Status, User } from '@src/app/models/UserMeta';
import { AuthService } from '@src/app/services/authentication/auth.service';
import { SocketService } from '@src/app/services/socket/socket.service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  user: User = {
    token: '',
    firstName: '',
    lastName: '',
    emailAddress: '',
    password: '',
    status: Status.OFFLINE,
    pseudo: '',

    averageCollaborationTime: 0,
    totalCollaborationTime: 0,
    numberCollaborationTeams: 0,
    numberCollaboratedDrawings: 0,
    numberAuthoredDrawings: 0,

    connectionHistory: {
      id: 0,
      date: '',
    },
    disconnectionHistory: {
      id: 0,
      date: '',
    },
    drawingEditionHistories: [],
  };

  updatePseudo: FormGroup;

  constructor(
    private router: Router,
    private auth: AuthService,
    private socketService: SocketService,
    private formBuilder: FormBuilder
  ) {
    this.socketService.getUserProfile({
      userId: this.auth.token$.value,
      visitedId: this.auth.token$.value,
    });

    this.socketService.receiveUserProfile().subscribe((profile: User) => {
      this.user = profile;
      console.log(`user loaded : ${profile.pseudo}`);
    });

    this.updatePseudo = this.formBuilder.group({
      pseudo: formBuilder.control(this.user.pseudo, []),
    });
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {}

  async onSubmit(formPseudo: FormGroup) {
    alert("we're ready to submit any changes");
    // detect changes

    // what to do
    // if empty -> use old username
    // if new username = old username -> use old username
    // if new username = illegal (someone already has it) -> use old username + throw error message
    // else use new username
    const nouveauPseudo = this.verifyPseudo(formPseudo.controls.pseudo.value);
    console.log(nouveauPseudo);
  }

  private verifyPseudo(nouveauPseudo: string) {
    const CURRENT_PSEUDO: string = this.user.pseudo;
    if (nouveauPseudo === '') return CURRENT_PSEUDO;
    if (nouveauPseudo === CURRENT_PSEUDO) return CURRENT_PSEUDO;
    return nouveauPseudo;
  }

  goLaunchingPage() {
    this.router.navigate(['/']);
  }
}

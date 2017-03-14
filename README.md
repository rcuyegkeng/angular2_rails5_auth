# Angular 2 and Ruby on Rails User Authentication

- Following this [blog post](https://hackernoon.com/angular-2-and-ruby-on-rails-user-authentication-fde230ddaed8#.m06ujdthk).

- [Blog's Repo containing Rails backend app on Github](https://github.com/avatsaev/rails-devise-token-seed)

## Part 1: Rails Backend

- create a rails project in API mode and Postgres db.
`rails new rails_devise_token_auth --api --database=postgresql`

- Add useful gems to Gemfile.
```
gem 'devise_token_auth'
gem 'omniauth'
gem 'rack-cors', :require => 'rack/cors'
```
    - Devise Token Auth leverages devise.
    - omniauth is a devise_token_auth dependency.
    - rack-cors allows cross domain ajax requests.

- install the gems
`bundle install` 

- Configure cors. Edit config/initializers/cors.rb.
```
Rails.application.config.middleware.use Rack::Cors do
  allow do
    origins '*'
    resource '*',
    :headers => :any,
    :expose  => ['access-token', 'expiry', 'token-type', 'uid', 'client'],
    :methods => [:get, :post, :options, :delete, :put]
  end
end
```

- Check the setup of the postgres database in config/database.yml
    + I made no changes
- Create the initial (blank) database:
`rails db:create`
    - n.b. I had to create the database before generating User model in the next step. An error was thrown if the database did not exist.

- Initialize the user model with DeviseTokenAuth
`rails generate devise_token_auth:install User auth`
    - User will be our model name
    - auth will be the endpoint of our user management rest api
        + e.g. /auth/sign_in, /auth/sign_out

- Configure User Model.
- Disable account email validation for this application
    + TODO: How does email validation work? How can it be customized? We'll need this function in a real application.
- remove `:confirmable` from the devise configuration in the User model.

- Create a default user in db/seeds.rb.
`User.create(email: 'user@example.com', nickname: 'UOne', name: 'User One', password: "monkey67")`
    - Our login will be user@example.com with the password monkey67

- migrate and seed the database
`rails db:migrate && rails db:seed`

- Author uses Paw to test API.
    + Paw is for Mac. We'll need an alternative that runs on Linux.
    + Can use curl.
    + Can use Postman.
        * Postman seems to work well.

- n.b. In the response the access-token is in the Headers.
    + The body contains the user record.

## Part2: Angular 2 Frontend

### Bootstrap and Configure project.

- We'll use Angular CLI, Materialize for UI, and Angular2Token for user management.

- [Author's Repo](https://github.com/avatsaev/angular-token-auth-seed)

#### Using Angular CLI.
- Angular CLI is a tool that allows us to bootstrap and manage an Angular app from the terminal
- Install with
`npm install -g @angular/cli`
    - This will install angular cli globally
    - I ran this command with sudo.
    - [Angular CLI Quickstart](https://angular.io/docs/ts/latest/cli-quickstart.html)

- Bootstrap an Angular CLI project
`ng new angular-token-auth --style=sass --skip-tests=true --routing true`
    - n.b. probably want tests in a real app.
    - n.b. initializes git for you.
    - n.b. using sass as default for styling
        + Do we want to use sass for our apps?
    - n.b. routing lets us define routes in our app.
        + This app will add a welcome page and a profile page.

- Can run app with:
`ng serve --open`
    - This will open the app in a browser.
    - It will also reload the app when it detects changes to source.
    - right now, the app does nothing but say 'app works!'.
    - uses port 4200.

#### We'll use MaterializeCSS to build the UI.

- like Twitter Bootstrap.
- 
- install with:
`npm install materialize-css angular2-materialize jquery@^2.2.4 hammerjs font-awesome --save`

- Include dependencis and styles in angular-cli.json
- in styles array:
```
"styles": [
  "styles.sass",
  "../node_modules/materialize-css/dist/css/materialize.css",
  "../node_modules/font-awesome/css/font-awesome.css"
],
```
- in scripts array:
```
"scripts": [
  "../node_modules/jquery/dist/jquery.js",
  "../node_modules/hammerjs/hammer.js",
  "../node_modules/materialize-css/dist/js/materialize.js"
]
```

- Dependency Injection in Main App Module so we can use Materialize Components.
- app.module.ts:
```
import { MaterializeModule } from 'angular2-materialize';
```
- Then add to imports array of our AppModule:
```
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    MaterializeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

#### Installing and Configuring Angular 2 Token

- angular2-token library was designed to work with DeviseAuthToken gem.

- Install and configure:
`npm install angular2-token --save`
    - n.b. the `--save` option makes the package appear in your dependencies.

- import and inject into main app module, src/app/app.module.ts
```
import { Angular2TokenService } from 'angular2-token';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    MaterializeModule,
  ],
  providers: [ Angular2TokenService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
```
    - n.b. Angular2TokenService is a service and is listed in the providers.

- Angular keeps environment config files in src/environments folder. 
    + environment.ts is the default configuration. It is used during development.
    + environment.prod.ts is used for production
        * to build for production use `ng build --prod`

- Create the config in src/app/environments/environment.ts.
```
export const environment = {
  production: false,
  token_auth_config: {
    apiBase: 'http://localhost:3000'
  }
};
```

- n.b. Angular2-Token has a lot of configuration options. See them [here](https://github.com/neroniaky/angular2-token#configuration).

- Initialize the Token service with this configuration in src/app/app.components.ts.
- import Angular2TokenService
```
import { Angular2TokenService } from "angular2-token";
```

- inject the token service into the ApplicationComponent and initialize it with our configuration.
    + Do this in the constructor.
```
export class AppComponent {
  title = 'app works!';
  constructor(private authToken: Angular2TokenService){
    this.authToken.init(environment.token_auth_config);
  }
}
```

- Also import the environment configuration.
```
import {environment} from "../environments/environment";
```

#### Testing the Token Service

- Try to Login as user@example.com : monkey67.
- We'll use the signIn method of the Token Service.
    + It takes an object with email and password keys as parameter and returns an Observable<Response>.
    + We'll subscribe to the Observable and log out the result.
- We'll make the call to signIn in the constructor.
- app.component.ts (partial code listing):
```
constructor(private authToken: Angular2TokenService){
    this.authToken.init(environment.token_auth_config);

    this.authToken.signIn({email: "user@example.com", password: "monkey67"}).subscribe(

        res => {

          console.log('auth response:', res);
          console.log('auth response headers: ', res.headers.toJSON()); //log the response header to show the auth token
          console.log('auth response body:', res.json()); //log the response body to show the user 
        },

        err => {
          console.error('auth error:', err);
        }
    )
}
```

- n.b. after showing that the signIn works remark out the test.
    + You can tell the test works by looking at the response body and headers in the console.

## Part 3. Frontend, login/register

- see [blog post](https://hackernoon.com/angular-2-and-ruby-on-rails-user-authentication-part-3-d938fcb7a334#.ahhwe0fht) for design of front end.

- n.b. Route Guard will check if user is logged in, if not, will redirect to home.

- n.b. TokenAuthService will manage login, register, logout, user profile data, verify token authenticity and check whther the user is logged in or not.
    + Is this service provided by Angular2TokenService?
    + or are we building a service on top of Angular2TokenService?

### Home Component and Home Route

- Use Angular CLI to generate the home component.
`ng g c home`
    - g is for generate and c is for component.
    - kinda like rails generators!
    - Files will be generated and the Home component is added to the app.module.ts declarations.

- create a route for it in src/app/app-routing.module.ts.
- Import the HomeComponent
```
import {HomeComponent} from "./home/home.component";
```
- Add home route to the routes array.
```
const routes: Routes = [
  {
    path: '',
    children: []
  },
  {
    path: 'home',
    component: HomeComponent
  }
];
```
- Make the home route the default route.
```
const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full'
  },
```

### Toolbar Component

- Generate a toolbar component with Angular CLI
`ng g c toolbar`

- Setup the toolbar's html template.
    + See code, toolbar.component.html, and blog post!

- Change home.component.html as well
    + See code and blog post.

- edit app.component.html to display the toolbar.
    + See code and blog post.

- n.b. that Angular CLI used the selector app-toolbar for the toolbar component, and app-home for the home component.

### Auth Dialog Component

- Use Angular CLI to create the AuthDialogComponent which will display the login and register forms.
`ng g c auth-dialog`
    - n.b. CLI converts the snake case (on command line) to camel case (in source code).
    - n.b. Rails convention is that classes use Camel case, database names use snake case. Database attributes use snake case. Rails Model names are singular. Rails Database names are plural.
        + rails snake case uses `_` instead of `-`. (need to verify this)

- edit auth-dialog.component.ts.
    + see code and blog post.
    + The Input decorator authMode takes 2 possible values: login or register.
        * login is the default value.
        * This allows us to pick the initial form to display when the dialog shows up.
    + modelActions is an event emitter, required by Materialize Dialog Directive.
        * We'll emit events on it to open or close our dialog.
    + openDialog takes mode as it's parameter.
        * will set the current auth mode and display the dialog.
            - login is the default value.
    + isLoginMode and isRegisterMode methods will help us to display the login or register forms conditionally.
    + _TODO: read up on Input decorator and EventEmitter._

- edit the dialog's template. auth-dialog.component.html.
    + See code and blog post.
    + We are using materialize modal directive, and passing modalActions event emitter for it's materializeActions input to be able to control the dialog by emitting events to it.
    + Right now the dialog is displaying the current mode and allowing us to switch modes.

- edit toolbar.component.html to include the auth-dialog component and create click events on Login and Register actions to open the Auth Dialog.
    + See code and blog post.
    + #authDialog is a reference to the AuthDialogComponent of our ToolbarComponent view. It will allow us to access the AuthDialogComponent class from the ToolbarComponent class.

- edit toolbar.component.ts.
    + See code and blog post.
    + ViewChild decorator will reference the AuthDialogComponent from our template so we can access it's methods and attributes directly from our ToolbarComponent class.
    + presentAuthDialog method takes an optional mode parameter (? mark makes it optional).
    + _TODO: read up on ViewChild decorator._

- We'll use the Token Service to display the correct actions in the toolbar depending on whether or not the user is authenticated.
    + Use the userSignedIn() method which returns true if the user is logged in.

- Import and inject Angular2TokenService into the ToolbarComponent.
    + edit toolbar.component.ts.
    + See code and blog post.
        * n.b. dependency injection done in parameter list of constructor.
            - Dependency Injection is a coding pattern where a class receives it's dependencies from external srouces rather than creating them itself.
            - The dependencies are passed as parameters of the constructor instead of the constructor creating them itself.
            - This style of coding is less brittle and more flexible.
                + The constructor doesn't care how the dependencies are instantiated; just that it receives them.
            - See Angular Documentation for more about Dependency Injection.

- Use the tokenAuthService's userSignedIn() method in the toolbar.component.html to hide/show actions conditionally.  Also attach the signOut method to it's action.
    + See code and blog post.

### Login and Register Forms

- Use Angular CLI to generate login and register form components.
```
ng g c login-form
ln g c register-form
```


 
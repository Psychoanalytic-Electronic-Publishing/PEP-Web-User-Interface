# Auth Reference (PEP UI + PaDS)

This document summarizes every auth method used by the UI, how each method reaches PaDS, and which business logic paths depend on auth state.

## Auth methods at a glance

| PaDS `loggedInMethod` value | User entry path | Authenticator path in app | PaDS touchpoints | Notes |
| --- | --- | --- | --- | --- |
| `Individual` | Username/password form (modal or sidebar) | `authenticator:credentials` | `POST /Authenticate`, `POST /Users/Logout` | Standard individual account login. |
| `IPAddress` | Institutional network access on SSR request | `authenticator:ip` | `GET /Authenticate/ip` | FastBoot-only IP check; uses signed IP header. |
| `Federated` | Federated/OpenAthens link from login dialog | External redirect, then `authenticator:ip` on return | Federated links endpoint (`FEDERATED_LOGIN_URL`), then `GET /Authenticate/ip?SessionId=...` | Federated auth is brokered by PaDS, then resolved into app session. |
| `ReferrerURL` | Referral/institution link from login dialog | External redirect, then `authenticator:ip` on return | Federated links endpoint (`FEDERATED_LOGIN_URL`), then `GET /Authenticate/ip?SessionId=...` | Same app-side resolution pattern as federated login. |
| `IPAddressIndividual` | Group/IP session upgraded with credentials | `authenticator:credentials` while already authenticated | `POST /Authenticate?SessionId=...` | Keeps group subscription context while attaching individual identity. |
| `FederatedIndividual` | Federated group session upgraded with credentials | `authenticator:credentials` while already authenticated | `POST /Authenticate?SessionId=...` | Same hybrid behavior as above. |
| `ReferrerURLIndividual` | Referral group session upgraded with credentials | `authenticator:credentials` while already authenticated | `POST /Authenticate?SessionId=...` | Same hybrid behavior as above. |

## End-to-end architecture

```mermaid
flowchart LR
    subgraph Client["PEP Web UI"]
        U["User"]
        UI["Login UI<br/>modal + sidebar"]
        ESA["ember-simple-auth + pep-session"]
        BL["Business logic listeners<br/>onAuthenticated + auth events"]
        REQ["AjaxService + ApplicationAdapter"]
    end

    subgraph PaDS["PaDS/Auth Services"]
        FEDS["Federated login metadata<br/>(FEDERATED_LOGIN_URL)"]
        AUTH["/Authenticate<br/>/Authenticate/ip<br/>/Users/Logout"]
        USERS["/Users"]
        DISQUS["/Disqus"]
    end

    subgraph Content["PEP Data APIs"]
        DATA["API_BASE_URL/API_NAMESPACE"]
    end

    U --> UI
    UI --> FEDS
    UI --> ESA
    ESA --> AUTH
    ESA --> REQ
    REQ --> DATA
    BL --> USERS
    BL --> DISQUS
    REQ --> USERS
    ESA --> BL
```

## Session bootstrap and IP auth (SSR path)

```mermaid
sequenceDiagram
    participant B as Browser request
    participant R as application/route.beforeModel
    participant S as pep-session
    participant IPA as authenticator:ip
    participant P as PaDS Auth API
    participant CU as current-user

    B->>R: Initial request (optional ?sessionId=...)
    alt FastBoot and (not authenticated OR sessionId query param exists)
        R->>S: authenticate("authenticator:ip")
        S->>IPA: authenticate()
        IPA->>P: GET /Authenticate/ip[?SessionId]
        Note over IPA,P: Adds client-ip + client-ip-signature headers in FastBoot
        P-->>IPA: SessionId, IsValidLogon, SessionExpires
        IPA-->>S: Session data (SessionType IP or Credentials)
        R->>R: Write fastboot workaround session cookie
    else Client boot with workaround cookie
        R->>R: Restore ESA session from workaround cookie
    end
    R->>CU: load(sessionId?)
    CU->>P: GET /Users?SessionId=...
```

## Credential login flow (including group-to-individual upgrade)

```mermaid
sequenceDiagram
    participant U as User
    participant AS as auth.openLoginModal
    participant FL as FEDERATED_LOGIN_URL
    participant LF as Forms::Login
    participant S as pep-session
    participant CA as authenticator:credentials
    participant P as PaDS Auth API
    participant OA as onAuthenticated()
    participant EV as authenticationAndSetupSucceeded

    U->>AS: Open login
    AS->>FL: GET ?sessionId=currentOrUnauthedSession
    FL-->>AS: Federated links + PaDS URLs
    AS-->>LF: Render login form
    U->>LF: Submit username/password
    LF->>S: authenticate("authenticator:credentials")
    S->>CA: authenticate(username, password)
    CA->>P: POST /Authenticate[?SessionId]
    alt IsValidLogon=true
        P-->>CA: Valid session payload
        CA->>CA: Clear unauth session cookie + schedule timeout
        S->>OA: handleAuthentication() (or manual call for group-to-individual)
        OA-->>EV: trigger auth success event
    else IsValidLogon=false
        P-->>CA: ReasonStr + SessionId
        CA->>CA: Save unauth session cookie
        CA-->>LF: Reject with login error
    end
```

## Federated/referrer handoff flow

```mermaid
flowchart LR
    A["User opens federated login options"] --> B["Click institution/OpenAthens link"]
    B --> C["PaDS/Federation authenticates externally"]
    C --> D["Redirect back to PEP with ?sessionId=..."]
    D --> E["application/route.beforeModel (FastBoot)"]
    E --> F["authenticator:ip calls /Authenticate/ip?SessionId=..."]
    F --> G["pep-session authenticated + current-user loaded"]
```

## Business logic driven by auth state

```mermaid
flowchart TD
    A["Session authenticated"] --> B["onAuthenticated(): load user + setup prefs/theme/lang/config"]
    B --> C["Emit authenticationAndSetupSucceeded"]
    C --> D["Reload gated content (search preview/read views/forms)"]
    B --> E["If hasIJPOpenSubscription: setup Disqus SSO via /Disqus"]
    B --> F["Expose PaDS account links (paDSHomeURL, reset/register URLs)"]
    A --> G["All API requests include client-session header"]
    A --> H["Downloads/prints include client-id + client-session query params"]
    I["Group or unauthenticated user edits protected prefs"] --> J["Show settings-auth info bar and prompt sign-in"]
    K["Credentials session timeout"] --> L["Show relogin info bar and allow inline re-auth"]
    M["Admin route access"] --> N["user.viewAdmin ability -> currentUser.user.isAdmin"]
```

## Core integration points in code

- Session/auth orchestration: `pep/app/services/pep-session.ts`, `pep/app/authenticators/credentials.ts`, `pep/app/authenticators/ip.ts`
- Login modal and federated link loading: `pep/app/services/auth.ts`, `pep/app/pods/components/forms/login/component.ts`, `pep/app/pods/components/modal-dialogs/user/federated-login/template.hbs`
- SSR bootstrap and IP auth trigger: `pep/app/pods/application/route.ts`
- Request headers and 401 handling: `pep/app/services/ajax.ts`, `pep/app/pods/application/adapter.ts`
- PaDS user model integration: `pep/app/pods/user/adapter.ts`, `pep/app/pods/user/serializer.ts`, `pep/app/services/current-user.ts`
- Auth-driven UI/business updates: `pep/app/utils/user.ts`, `pep/app/pods/components/information-bar/bars/relogin/component.ts`, `pep/app/pods/components/information-bar/bars/settings-auth/component.ts`
- PaDS account/self-service links in UI: `pep/app/pods/components/modal-dialogs/user/info/component.ts`, `pep/app/pods/components/forms/login/template.hbs`

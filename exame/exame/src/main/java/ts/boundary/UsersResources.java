package ts.boundary;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.security.PermitAll;
import javax.annotation.security.RolesAllowed;
import javax.inject.Inject;
import javax.json.Json;
import javax.json.JsonObject;
import javax.validation.Valid;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.NotAuthorizedException;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.container.ResourceContext;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriInfo;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import static org.hibernate.annotations.common.util.impl.LoggerFactory.logger;
import static org.hibernate.internal.HEMLogging.logger;
import ts.entity.User;
import ts.boundary.mapping.Credential;
import ts.boundary.mapping.UserDTO;
import ts.store.UserStore;

@Path("users")
@Tag(name = "Gestione Users", description = "Permette di gestire gli utenti di bkmapp")
@PermitAll
public class UsersResources {
    
    @Inject
    private UserStore storeuser;
    
    @Context
    ResourceContext rc;
    
    @Context
    UriInfo uriInfo;
        
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(description = "Restituisce l'elenco di tutti gli utenti")
    @APIResponses({
        @APIResponse(responseCode = "200", description = "Elenco ritornato con successo"),
        @APIResponse(responseCode = "404", description = "Elenco non trovato")
    })
    @PermitAll
    public List<UserDTO> all() {
        List<UserDTO> usList = new ArrayList<>();
        storeuser.all().forEach(e -> {
            UserDTO us = new UserDTO();
            us.id = e.getId();
            us.name = e.getName();
            us.email = e.getEmail();
            us.pwd = ""; // Lascia vuota la password per sicurezza
            usList.add(us); // Aggiungi l'oggetto UserDTO alla lista
        });
        return usList;
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(description = "Permette la registrazione di un nuovo utente")
    @APIResponses({
        @APIResponse(responseCode = "201", description = "Nuovo utente creato con successo"),
        @APIResponse(responseCode = "404", description = "Creazione di utente fallito")
    })
    @PermitAll
    public Response create(@Valid User entity) {
        // Verifica se l'utente esiste già con l'email fornita
        if (storeuser.findUserbyLogin(entity.getEmail()).isPresent()) {
            return Response.status(Response.Status.PRECONDITION_FAILED).build();
        }

        // Verifica che la password abbia almeno 4 caratteri
        if (entity.getPwd().length() < 4) {
            return Response.status(Response.Status.PRECONDITION_FAILED).build();
        }

        // Salva l'utente nel database
        User saved = storeuser.save(entity);

        // Ritorna la risposta di successo con lo stato 201
        return Response.status(Response.Status.CREATED)
                .entity(saved)
                .build();
    }
    
    @POST
    @Path("login")
    @Operation(description = "Permette fare login e restituisce il token valido")
    @APIResponses({
        @APIResponse(responseCode = "200", description = "Login fatto con successo"),
        @APIResponse(responseCode = "404", description = "Login fallito")
    })
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @PermitAll
    public UserDTO login(@Valid Credential credential) {
        // Login e verifica delle credenziali
        User u = storeuser.login(credential)
            .orElseThrow(() -> new NotAuthorizedException("User non Authorized",  
                                                          Response.status(Response.Status.UNAUTHORIZED).build()));
        // Creazione del DTO per restituire i dati
        UserDTO us = new UserDTO();
        us.id = u.getId();
        us.name = u.getName();
        us.email = u.getEmail();
        us.pwd = ""; // Non restituiamo mai la password

        return us;
    }
    
@DELETE
@Path("{id}")
@Operation(description = "Cancel User tramite l'ID")
@APIResponses({
    @APIResponse(responseCode = "200", description = "Utente cancellato con successo"),
    @APIResponse(responseCode = "404", description = "Utente non trovato")
})
@Produces(MediaType.APPLICATION_JSON)
public Response deleteUser(@PathParam("id") Long id) {
    User found = storeuser.find(id).orElseThrow(() -> new NotFoundException("Utente non trovato. id=" + id));
    found.setCanceled(true);
    User updated = storeuser.update(found);
    return Response.ok(updated).build();
}

    
@PUT
@Path("/{id}")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Operation(description = "Aggiornamento Utente")
@APIResponses({
    @APIResponse(responseCode = "200", description = "Utente aggiornato con successo"),
    @APIResponse(responseCode = "404", description = "Utente non trovato"),
    @APIResponse(responseCode = "500", description = "Errore interno del server")
})
public Response updateUser(@Valid UserDTO entity) {
    try {
        // Trova l'utente esistente nel database
        User found = storeuser.find(entity.id)
            .orElseThrow(() -> new NotFoundException("User not found. id=" + entity.id));
        
        // Aggiorna i campi dell'utente
        found.setName(entity.name);
        found.setEmail(entity.email);
        found.setPwd(entity.pwd);
        // Aggiungi altri campi se necessario
        
        // Salva l'entità aggiornata nel database
        User updated = storeuser.update(found);
        
        // Restituisci la risposta con successo
        return Response.status(Response.Status.OK)
            .entity(updated)
            .build();
    } catch (NotFoundException e) {
        // Gestisce il caso in cui l'utente non viene trovato
        return Response.status(Response.Status.NOT_FOUND)
            .entity(e.getMessage())
            .build();
    } catch (Exception e) {
        // Gestisce eventuali altri errori
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
            .entity("Errore durante l'aggiornamento dell'utente: " + e.getMessage())
            .build();
    }
}


}

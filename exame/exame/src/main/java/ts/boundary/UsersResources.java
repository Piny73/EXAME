package ts.boundary;

import java.util.ArrayList;
import java.util.List;
import javax.annotation.security.PermitAll;
import javax.inject.Inject;
import javax.validation.Valid;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.NotFoundException;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import ts.entity.User;
import ts.boundary.mapping.UserDTO;
import ts.store.UserStore;

@Path("users")
@Tag(name = "Gestione Users", description = "Permette di gestire gli utenti di Timesheet")
@PermitAll
public class UsersResources {
    
    @Inject
    private UserStore storeuser;
           
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(description = "Elenco di tutti gli utenti")
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
            us.name = e.getNamesurname();
            us.email = e.getEmail();
            us.pwd = ""; 
            usList.add(us);
        });
        return usList;
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(description = "Registrazione di un nuovo utente")
    @APIResponses({
        @APIResponse(responseCode = "201", description = "Nuovo utente creato con successo"),
        @APIResponse(responseCode = "404", description = "Creazione di utente fallito")
    })
    @PermitAll
    public Response create(@Valid User entity) {
        System.out.println("Received entity: " + entity);
        if (storeuser.findUserbyLogin(entity.getEmail()).isPresent()) {
            return Response.status(Response.Status.PRECONDITION_FAILED).build();
        }
        if (entity.getPwd().length() < 4) {
            return Response.status(Response.Status.PRECONDITION_FAILED).build();
        }
        User saved = storeuser.save(entity);
        return Response.status(Response.Status.CREATED)
                .entity(saved)
                .build();
    }

@DELETE
@Path("{id}")
@Operation(description = "Cancellazione Utente tramite l'ID")
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
        User found = storeuser.find(entity.id)
            .orElseThrow(() -> new NotFoundException("Utente non trovato. id=" + entity.id));
        found.setNamesurname(entity.name);
        found.setEmail(entity.email);
        found.setPwd(entity.pwd);
        
        User updated = storeuser.update(found);
        
        return Response.status(Response.Status.OK)
            .entity(updated)
            .build();
    } catch (NotFoundException e) {
        return Response.status(Response.Status.NOT_FOUND)
            .entity(e.getMessage())
            .build();
    } catch (Exception e) {
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
            .entity("Errore durante l'aggiornamento dell'utente: " + e.getMessage())
            .build();
    }
}
}

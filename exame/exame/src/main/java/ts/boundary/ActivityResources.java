/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
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
import ts.boundary.mapping.ActivityDTO;
import ts.entity.Activity;
import ts.entity.User;
import ts.store.ActivityStore;
import ts.store.UserStore;


@Path("activity")
@Tag(name = "Activity Management", description = "Activity Business Logic")
@PermitAll
public class ActivityResources {
    
    @Inject
    private UserStore storeuser;

    @Inject
    private ActivityStore storeactivity;
  
@GET
@Produces(MediaType.APPLICATION_JSON)
@Operation(description = "Restituisce l'elenco di tutte le Attività")
@APIResponses({
@APIResponse(responseCode = "200", description = "Success"),
@APIResponse(responseCode = "404", description = "Failed")
})
@PermitAll
public List<ActivityDTO> allActivity() {
    List<ActivityDTO> acList = new ArrayList<>();
    storeactivity.all().forEach(e -> {
        ActivityDTO ac = new ActivityDTO();
        
        ac.id = e.getId();
        ac.description = e.getDescription();
        ac.ownerid = e.getOwner().getId();
        ac.ownerName = e.getOwner() != null ? e.getOwner().getNamesurname() : "N/A"; // Restituisce il nome del proprietario
        ac.dtstart = e.getDtstart();
        ac.dtend = e.getDtend();
        ac.enable = e.isEnable();
    
        acList.add(ac);
    });
    return acList;
}

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(description = "New Activity")
    @APIResponses({
        @APIResponse(responseCode = "201", description = "Success"),
        @APIResponse(responseCode = "404", description = "Failed")
    })
    @PermitAll
    public Response createActivity(@Valid ActivityDTO entity) {
        
        Activity ac = new Activity();
        ac.setOwner(storeuser.find(entity.ownerid).orElseThrow(() -> new NotFoundException("Activity not found. id=" + entity.ownerid)));
        ac.setDescription(entity.description);
        ac.setDescription(entity.description);
        ac.setDtstart(entity.dtstart);
        ac.setDtend(entity.dtend);
        ac.setEnable(entity.enable);
        
        ac = storeactivity.save(ac);
        entity.id = ac.getId();
        return Response.status(Response.Status.CREATED)
                .entity(entity)
                .build();
    }
 
      
@DELETE
@Path("{id}")
@Operation(description = "Cancellazione attività tramite l'ID")
@APIResponses({
    @APIResponse(responseCode = "200", description = "Attività cancellata con successo"),
    @APIResponse(responseCode = "404", description = "Attività non trovata")
})
@Produces(MediaType.APPLICATION_JSON)
public Response deleteActivity(@PathParam("id") Long id) {
    Activity found = storeactivity.find(id).orElseThrow(() -> new NotFoundException("Attività non trovata. id=" + id));
    found.setCanceled(true);
    storeactivity.update(found);
    return Response.status(Response.Status.OK).build();
}

    
@PUT
@Path("{id}")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Operation(description = "Aggiornamento Attività")
@APIResponses({
    @APIResponse(responseCode = "200", description = "Attività aggiornata con successo"),
    @APIResponse(responseCode = "404", description = "Attività non trovata"),
    @APIResponse(responseCode = "500", description = "Errore interno del server")
})
public Response updateActivity(@Valid ActivityDTO entity) {
    try {
        Activity found = storeactivity.find(entity.id)
            .orElseThrow(() -> new NotFoundException("Activity not found. id=" + entity.id));
        User owner = storeuser.find(entity.ownerid)
            .orElseThrow(() -> new NotFoundException("User not found. id=" + entity.ownerid));
        found.setOwner(owner);
        found.setDtstart(entity.dtstart);
        found.setDtend(entity.dtend);
        found.setDescription(entity.description);
        found.setEnable(entity.enable);
        
        storeactivity.save(found);
        
        return Response.status(Response.Status.OK).build();
    } catch (NotFoundException e) {
        return Response.status(Response.Status.NOT_FOUND)
            .entity(e.getMessage())
            .build();
    } catch (Exception e) {
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
            .entity("Errore durante l'aggiornamento dell'attività: " + e.getMessage())
            .build();
    }
}
}
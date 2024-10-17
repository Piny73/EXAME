package ts.boundary;

import ts.boundary.mapping.TimeSheetDTO;
import ts.entity.Activity;
import ts.entity.TimeSheet;
import ts.entity.User;

import javax.annotation.security.PermitAll;
import javax.inject.Inject;
import javax.validation.Valid;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.List;
import javax.ws.rs.core.Context;
import javax.ws.rs.container.ResourceContext;
import javax.ws.rs.core.UriInfo;
import ts.store.ActivityStore;
import ts.store.TimeSheetStore;
import ts.store.UserStore;
import javax.ws.rs.NotFoundException;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("timesheet")
@Tag(name = "TimeSheet Management", description = "TimeSheet Business Logic")
@PermitAll
public class TimeSheetResources {

    @Inject
    private UserStore storeuser;

    @Inject
    private ActivityStore storeactivity;

    @Inject
    private TimeSheetStore storets;

    @Context
    ResourceContext rc;

    @Context
    UriInfo uriInfo;

    @GET
    @Path("{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(description = "Restituisce l'elenco di TimeSheet di un Utente")
    @APIResponses({
        @APIResponse(responseCode = "200", description = "Elenco ritornato con successo"),
        @APIResponse(responseCode = "404", description = "Elenco non trovato")
    })
    @PermitAll
    public List<TimeSheetDTO> all(@PathParam("id") Long id, @DefaultValue("1") @QueryParam("page") int page, @DefaultValue("10") @QueryParam("size") int size) {
        User found = storeuser.find(id).orElseThrow(() -> new NotFoundException("Timesheet non trovato. id=" + id));

        List<TimeSheetDTO> tsList = new ArrayList<>();

        storets.all(id).forEach(e -> {
            TimeSheetDTO ts = new TimeSheetDTO();
            ts.id = e.getId();
            ts.activityid = e.getActivity().getId();
            ts.userid = e.getUser().getId();
            ts.dtstart = e.getDtstart();
            ts.dtend = e.getDtend();
            ts.detail = e.getDetail();
            ts.hoursPerDay = e.getHoursPerDay();  // Aggiungi le ore per giorno
            tsList.add(ts);
        });

        return tsList;
    }

    /**
     * REST service to create a new timesheet.
     */
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(description = "Crea un nuovo TimeSheet")
    @APIResponses({
        @APIResponse(responseCode = "201", description = "Timesheet creato con successo"),
        @APIResponse(responseCode = "404", description = "Creazione fallita")
    })
    @PermitAll
    public Response createTimeSheet(@Valid TimeSheetDTO entity) {

        TimeSheet ts = new TimeSheet();
        ts.setActivity(storeactivity.find(entity.activityid)
            .orElseThrow(() -> new NotFoundException("Activity not found: " + entity.activityid)));
        ts.setUser(storeuser.find(entity.userid)
            .orElseThrow(() -> new NotFoundException("User not found: " + entity.userid)));
        ts.setDetail(entity.detail);

        // Eredita dtstart e dtend dall'activity
        ts.setDtstart(ts.getActivity().getDtstart());
        ts.setDtend(ts.getActivity().getDtend());

        // Imposta le ore per giorno
        ts.setHoursPerDay(entity.hoursPerDay);

        // Salva il timesheet nel database
        storets.save(ts);

        // Restituisci l'id generato
        entity.id = ts.getId();
        return Response.status(Response.Status.CREATED).entity(entity).build();
    }

    /**
     * REST service to update an existing timesheet.
     */
    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(description = "Aggiorna un TimeSheet esistente")
    @APIResponses({
        @APIResponse(responseCode = "200", description = "Timesheet aggiornato con successo"),
        @APIResponse(responseCode = "404", description = "Aggiornamento fallito")
    })
    public Response updateTimeSheet(@Valid TimeSheetDTO entity) {
        TimeSheet found = storets.find(entity.id)
            .orElseThrow(() -> new NotFoundException("TimeSheet not found: " + entity.id));

        // Imposta nuovamente i dettagli dell'utente e della descrizione
        found.setUser(storeuser.find(entity.userid)
            .orElseThrow(() -> new NotFoundException("User not found: " + entity.userid)));
        found.setDetail(entity.detail);

        // Aggiorna la mappa delle ore giornaliere
        found.setHoursPerDay(entity.hoursPerDay);

        // Salva i cambiamenti nel database
        storets.update(found);

        return Response.status(Response.Status.OK).build();
    }

    /**
     * REST service to delete a timesheet by ID.
     */
    @DELETE
    @Path("{id}")
    @Operation(description = "Cancella un TimeSheet tramite l'ID")
    @APIResponses({
        @APIResponse(responseCode = "200", description = "Timesheet cancellato con successo"),
        @APIResponse(responseCode = "404", description = "Eliminazione fallita")
    })
    @Produces(MediaType.APPLICATION_JSON)
    @PermitAll
    public Response deleteTimeSheet(@PathParam("id") Long id) {
        TimeSheet found = storets.find(id)
            .orElseThrow(() -> new NotFoundException("TimeSheet non trovato. id=" + id));

        found.setCanceled(true);
        storets.remove(found);

        return Response.status(Response.Status.OK).build();
    }
}

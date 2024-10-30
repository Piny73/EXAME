/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package ts.boundary;

import ts.services.ActivityTimesheetService;

import javax.inject.Inject;
import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Path("/activity-timesheets")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ActivityTimesheetResource {

    @Inject
    private ActivityTimesheetService activityTimesheetService;

    @GET
    public Response getActivityTimesheetData() {
        List<Object[]> results = activityTimesheetService.getActivityTimesheetData();
        List<Map<String, Object>> response = new ArrayList<>();

        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("activity_id", row[0]);
            map.put("activity_description", row[1]);
            map.put("activity_start", row[2]);
            map.put("activity_end", row[3]);
            map.put("timesheet_id", row[4]);
            map.put("timesheet_detail", row[5]);
            map.put("timesheet_start", row[6]);
            map.put("timesheet_end", row[7]);
            map.put("hours_worked", row[8]);
            response.add(map);
        }

        return Response.ok(response).build();
    }
}

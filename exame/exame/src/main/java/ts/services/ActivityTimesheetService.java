/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package ts.services;

import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;
import java.util.List;

@Stateless
public class ActivityTimesheetService {

    @PersistenceContext
    private EntityManager entityManager;
    
    public List<Object[]> getActivityTimesheetData() {
        String sql = "SELECT " +
                "a.id AS activity_id, " +
                "a.description AS activity_description, " +
                "a.dtstart AS activity_start, " +
                "a.dtend AS activity_end, " +
                "t.id AS timesheet_id, " +
                "t.detail AS timesheet_detail, " +
                "t.dtstart AS timesheet_start, " +
                "t.dtend AS timesheet_end, " +
                "t.hours_worked " +
                "FROM activity a " +
                "LEFT JOIN timesheet t ON a.id = t.activity_id AND t.canceled = 0 " +  // Filtra i timesheet non cancellati
                "WHERE a.canceled = 0 " +  // Filtra le attività non cancellate
                "ORDER BY a.id, t.dtstart";

        Query query = entityManager.createNativeQuery(sql);
        return query.getResultList();
    }
}

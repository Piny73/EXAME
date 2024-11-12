package ts.services;

import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;

@Stateless
public class TimeSheetService {

    @PersistenceContext
    private EntityManager entityManager;
    
    protected EntityManager getEm() {
        return entityManager;
    }

 public int getTotalHoursByActivity(Long activityId) {
    System.out.println("Activity ID: " + activityId);
    
    TypedQuery<Long> query = getEm().createQuery(
        "SELECT SUM(ts.hoursWorked) FROM TimeSheet ts WHERE ts.activity.id = :activityId AND ts.canceled = 0 AND ts.enable = 0",
        Long.class
    );
    query.setParameter("activityId", activityId);
    
    Long totalHours = query.getSingleResult();
    System.out.println("Total hours found: " + totalHours);
    
    return totalHours != null ? totalHours.intValue() : 0;
}

}

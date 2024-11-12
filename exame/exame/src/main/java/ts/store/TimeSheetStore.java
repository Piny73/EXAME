package ts.store;

import java.util.List;
import java.util.Optional;
import javax.enterprise.context.RequestScoped;
import javax.persistence.TypedQuery;
import javax.transaction.Transactional;
import ts.entity.TimeSheet;

@RequestScoped
@Transactional(Transactional.TxType.REQUIRED)
public class TimeSheetStore extends BaseStore<TimeSheet> {
    

    public List<TimeSheet> all(Long userId) {
        return getEm().createQuery("SELECT e FROM TimeSheet e WHERE e.user.id = :userId AND e.enable = false", TimeSheet.class)
                .setParameter("userId", userId)
                .getResultList();
    }

    public Optional<TimeSheet> find(Long id) {
        TimeSheet found = getEm().find(TimeSheet.class, id);
        return Optional.ofNullable(found);
    }
    

    public List<TimeSheet> findAll() {
       return getEm().createQuery("select e from TimeSheet e where e.canceled = false", TimeSheet.class)
                .getResultList();
    }

 public int getTotalHoursByActivity(Long activityId) {
    TypedQuery<Long> query = getEm().createQuery(
        "SELECT SUM(ts.hoursWorked) FROM TimeSheet ts WHERE ts.activity.id = :activityId AND ts.canceled = 0 AND ts.enable = 0",
        Long.class
    );
    query.setParameter("activityId", activityId);
    
    Long totalHours = query.getSingleResult();
    return totalHours != null ? totalHours.intValue() : 0;
}

}

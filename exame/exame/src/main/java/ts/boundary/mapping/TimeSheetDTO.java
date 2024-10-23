package ts.boundary.mapping;

import java.time.LocalDate;
import java.time.LocalDateTime;
import javax.json.bind.annotation.JsonbTypeAdapter;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import ts.entity.adapter.LocalDateTimeAdapter;

public class TimeSheetDTO {

    public Long id;  

    @NotNull
    public Long activityid;  

    @NotNull
    public Long userid;  

    @NotNull
    @JsonbTypeAdapter(LocalDateTimeAdapter.class)
    public LocalDateTime dtstart;  

    @NotNull
    @JsonbTypeAdapter(LocalDateTimeAdapter.class)
    public LocalDateTime dtend;  

    @NotBlank
    public String detail;  

    @NotNull
    public Integer hoursWorked;  // Nuovo campo per il numero di ore lavorate

    @NotNull
    public LocalDate workDate;  // Nuovo campo per la data di lavoro

    @Override
    public String toString() {
        return "TimeSheetDTO{" + 
               "id=" + id + 
               ", activityid=" + activityid + 
               ", userid=" + userid + 
               ", dtstart=" + dtstart + 
               ", dtend=" + dtend + 
               ", detail='" + detail + '\'' + 
               ", hoursWorked=" + hoursWorked + 
               ", workDate=" + workDate + 
               '}';
    }
}

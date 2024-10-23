package ts.entity.adapter;


import javax.json.bind.adapter.JsonbAdapter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public class LocalDateTimeAdapter implements JsonbAdapter<LocalDateTime, String> {

    // Formatter per il formato backend (yyyy-MM-ddTHH:mm)
    private static final DateTimeFormatter BACKEND_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");

    // Formatter per il formato frontend (dd/MM/yyyyTHH:mm)
    private static final DateTimeFormatter FRONTEND_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy'T'HH:mm");

    @Override
    public String adaptToJson(LocalDateTime dateTime) {
        // Converte LocalDateTime in stringa formattata utilizzando il formato backend
        return dateTime.format(BACKEND_FORMATTER);
    }

    @Override
    public LocalDateTime adaptFromJson(String dateTimeStr) {
        try {
            // Tenta di convertire la stringa utilizzando il formato backend
            return LocalDateTime.parse(dateTimeStr, BACKEND_FORMATTER);
        } catch (DateTimeParseException e1) {
            try {
                // Se il parsing fallisce, prova a usare il formato frontend
                return LocalDateTime.parse(dateTimeStr, FRONTEND_FORMATTER);
            } catch (DateTimeParseException e2) {
                // Se fallisce anche con il formato frontend, lancia un'eccezione
                throw new RuntimeException("Errore nel parsing della data: " + dateTimeStr, e2);
            }
        }
    }
}

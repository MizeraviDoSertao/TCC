package com.unip.fraud.adapter.in;

import com.unip.fraud.application.domain.ImportFileCommand;
import com.unip.fraud.application.domain.ModelTrainingView;
import com.unip.fraud.application.service.ModelTrainingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.security.Principal;

@RestController
@RequestMapping("/models")
public class ModelController {

  private final ModelTrainingService service;

  public ModelController(final ModelTrainingService service) {
    this.service = service;
  }

  @GetMapping
  public List<ModelTrainingView> list() {
    return service.list();
  }

  @PostMapping("/train")
  public ResponseEntity<ModelTrainingView> train(
      @RequestParam("file") final MultipartFile file,
      final Principal principal) {
    final ImportFileCommand command = new ImportFileCommand(
        file.getOriginalFilename(), file.getSize(), file::getInputStream
    );
    return ResponseEntity.accepted().body(service.requestTraining(command, principal.getName()));
  }

  @PostMapping("/{trainingId}/activate")
  public ResponseEntity<ModelTrainingView> activate(
      @PathVariable final UUID trainingId,
      final Principal principal) {
    return ResponseEntity.accepted().body(service.requestActivation(trainingId, principal.getName()));
  }
}

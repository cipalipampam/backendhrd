import { Router } from "express";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

/**
 * Helper function untuk menjalankan Python script
 */
function runPythonPredict(inputData) {
  return new Promise((resolve, reject) => {
    // Path ke predict.py di root project (3 level up dari router/promotion-ai/)
    const scriptPath = path.join(__dirname, "../../../predict.py");
    
    const python = spawn("python", [scriptPath, JSON.stringify(inputData)]);

    let dataString = "";
    let errorString = "";

    python.stdout.on("data", (data) => {
      dataString += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorString += data.toString();
    });

    python.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(
            `Python script exited with code ${code}: ${errorString}`
          )
        );
        return;
      }

      try {
        const result = JSON.parse(dataString);
        if (result.error) {
          reject(new Error(result.error));
        } else {
          resolve(result);
        }
      } catch (error) {
        reject(new Error(`Failed to parse Python output: ${error.message}`));
      }
    });

    python.on("error", (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });
  });
}

/**
 * POST /api/predict
 * Prediksi promosi berdasarkan data karyawan
 */
router.post("/", async (req, res) => {
  try {
    const inputData = req.body;

    const requiredFields = [
      "departemen",
      "pendidikan",
      "gender",
      "jalur_rekrut",
      "jumlah_pelatihan",
      "umur",
      "lama_bekerja",
      "KPI_>80%",
      "penghargaan",
      "rata_rata_score_pelatihan",
    ];

    const missingFields = requiredFields.filter(
      (field) => !(field in inputData)
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields",
        missing_fields: missingFields,
      });
    }

    const result = await runPythonPredict(inputData);

    res.json({
      status: 200,
      message: "Prediction successful",
      data: {
        input: inputData,
        prediction: result.prediction === 1 ? "Promosi" : "Tidak Promosi",
        prediction_value: result.prediction,
        probability: result.probability,
        confidence: result.confidence,
      },
    });
  } catch (error) {
    console.error("Prediction error:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

/**
 * POST /api/predict/karyawan/:id
 * Prediksi promosi untuk karyawan tertentu berdasarkan ID
 */
router.post("/karyawan/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { year } = req.body;

    if (!year) {
      return res.status(400).json({
        status: 400,
        message: "Year is required",
      });
    }

    // Fetch karyawan features dari endpoint yang sudah ada
    const baseUrl = `http://localhost:${process.env.PORT || 3000}`;
    const response = await fetch(
      `${baseUrl}/api/karyawan-features/${id}?year=${year}`,
      {
        headers: {
          Authorization: req.headers.authorization,
        },
      }
    );

    if (!response.ok) {
      return res.status(404).json({
        status: 404,
        message: "Karyawan not found",
      });
    }

    const karyawanData = await response.json();
    const features = karyawanData.data;

    console.log("Features for prediction:", features);
    console.log("prediction:", features.jalur_rekrut);

    const inputData = {
      departemen: features.departemen,
      pendidikan: features.pendidikan,
      gender: features.gender,
      jalur_rekrut: features.jalur_rekrut,
      jumlah_pelatihan: features.jumlah_pelatihan,
      umur: features.umur,
      lama_bekerja: features.lama_bekerja,
      "KPI_>80%": features.kpi_diatas_80,
      penghargaan: features.penghargaan,
      rata_rata_score_pelatihan: features.rata_rata_score_pelatihan,
    };

    const result = await runPythonPredict(inputData);

    res.json({
      status: 200,
      message: "Prediction successful",
      data: {
        karyawan_id: features.karyawan_id,
        nama: features.nama,
        year: year,
        features: inputData,
        prediction: result.prediction === 1 ? "Promosi" : "Tidak Promosi",
        prediction_value: result.prediction,
        probability: result.probability,
        confidence: result.confidence,
      },
    });
  } catch (error) {
    console.error("Prediction error:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

/**
 * POST /api/predict/batch
 * Prediksi promosi untuk multiple karyawan
 */
router.post("/batch", async (req, res) => {
  try {
    const { year, filter } = req.body;

    if (!year) {
      return res.status(400).json({
        status: 400,
        message: "Year is required",
      });
    }

    const baseUrl = `http://localhost:${process.env.PORT || 3000}`;
    const response = await fetch(
      `${baseUrl}/api/karyawan-features?year=${year}`,
      {
        headers: {
          Authorization: req.headers.authorization,
        },
      }
    );

    if (!response.ok) {
      return res.status(500).json({
        status: 500,
        message: "Failed to fetch karyawan data",
      });
    }

    const karyawanDataList = await response.json();
    const featuresList = karyawanDataList.data;

    const predictions = await Promise.all(
      featuresList.map(async (features) => {
        const inputData = {
          departemen: features.departemen,
          pendidikan: features.pendidikan,
          gender: features.gender,
          jalur_rekrut: features.jalur_rekrut,
          jumlah_pelatihan: features.jumlah_pelatihan,
          umur: features.umur,
          lama_bekerja: features.lama_bekerja,
          "KPI_>80%": features.kpi_diatas_80,
          penghargaan: features.penghargaan,
          rata_rata_score_pelatihan: features.rata_rata_score_pelatihan,
        };

        try {
          const result = await runPythonPredict(inputData);
          return {
            karyawan_id: features.karyawan_id,
            nama: features.nama,
            prediction: result.prediction === 1 ? "Promosi" : "Tidak Promosi",
            prediction_value: result.prediction,
            probability: result.probability,
            confidence: result.confidence,
          };
        } catch (error) {
          return {
            karyawan_id: features.karyawan_id,
            nama: features.nama,
            error: error.message,
          };
        }
      })
    );

    let filteredPredictions = predictions;
    if (filter === "promosi") {
      filteredPredictions = predictions.filter((p) => p.prediction_value === 1);
    } else if (filter === "tidak_promosi") {
      filteredPredictions = predictions.filter((p) => p.prediction_value === 0);
    }

    res.json({
      status: 200,
      message: "Batch prediction successful",
      year: year,
      total: filteredPredictions.length,
      data: filteredPredictions,
    });
  } catch (error) {
    console.error("Batch prediction error:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
});

export default router;
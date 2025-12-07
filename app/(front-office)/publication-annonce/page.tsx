// app/ads/components/PublishAdModal.tsx
"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImage,
  faTag,
  faMoneyBill,
  faMapMarkerAlt,
  faAlignLeft,
} from "@fortawesome/free-solid-svg-icons";
import colors from "../../shared/constants/colors";

interface PublishAdModalProps {
  visible: boolean;
  onHide: () => void;
  isLoggedIn: boolean;
  onLoginRequired: () => void;
}

interface AdData {
  title: string;
  description: string;
  category: string;
  price: number | null;
  location: string;
  images: File[];
}

const PublishAdModal: React.FC<PublishAdModalProps> = ({
  visible,
  onHide,
  isLoggedIn,
  onLoginRequired,
}) => {
  const [adData, setAdData] = useState<AdData>({
    title: "",
    description: "",
    category: "",
    price: null,
    location: "",
    images: [],
  });

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const categories = [
    { label: "Don & Échange", value: "dons-echanges" },
    { label: "Vêtements & Chaussures", value: "vetements-chaussures" },
    { label: "Électronique", value: "electroniques" },
    { label: "Éducation & Culture", value: "education-culture" },
    { label: "Services de proximité", value: "services-proximite" },
    { label: "Maison & Jardin", value: "maison-jardin" },
    { label: "Véhicules", value: "vehicules" },
    { label: "Emploi & Services", value: "emploi-services" },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files);
      setAdData({
        ...adData,
        images: [...adData.images, ...newImages],
      });

      // Créer des aperçus d'images
      const newPreviews = newImages.map((file) => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...adData.images];
    const newPreviews = [...imagePreviews];

    newImages.splice(index, 1);
    newPreviews.splice(index, 1);

    setAdData({ ...adData, images: newImages });
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }

    setLoading(true);
    try {
      // Simuler l'envoi des données
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Annonce publiée:", adData);

      // Réinitialiser le formulaire
      setAdData({
        title: "",
        description: "",
        category: "",
        price: null,
        location: "",
        images: [],
      });
      setImagePreviews([]);
      setStep(1);

      onHide();

      // Afficher un message de succès
      alert("Votre annonce a été publiée avec succès !");
    } catch (error) {
      console.error("Erreur lors de la publication:", error);
      alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Informations principales
      </h3>

      <div className="space-y-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titre de l'annonce *
          </label>
          <span className="p-input-icon-left w-full">
            <FontAwesomeIcon
              icon={faTag}
              className="text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
            />
            <InputText
              placeholder="Ex: iPhone 12 Pro Max en excellent état"
              className="w-full pl-10 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-oskar-green focus:border-transparent"
              value={adData.title}
              onChange={(e) => setAdData({ ...adData, title: e.target.value })}
              required
            />
          </span>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Catégorie *
          </label>
          <span className="p-input-icon-left w-full">
            <FontAwesomeIcon
              icon={faTag}
              className="text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
            />
            <Dropdown
              value={adData.category}
              options={categories}
              onChange={(e) => setAdData({ ...adData, category: e.value })}
              placeholder="Sélectionnez une catégorie"
              className="w-full pl-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-oskar-green focus:border-transparent"
              required
            />
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix (FCFA)
            </label>
            <span className="p-input-icon-left w-full">
              <FontAwesomeIcon
                icon={faMoneyBill}
                className="text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
              />
              <InputNumber
                placeholder="Ex: 150000"
                className="w-full pl-10 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-oskar-green focus:border-transparent"
                value={adData.price}
                onValueChange={(e) => setAdData({ ...adData, price: e.value })}
                mode="decimal"
                min={0}
              />
            </span>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Localisation *
            </label>
            <span className="p-input-icon-left w-full">
              <FontAwesomeIcon
                icon={faMapMarkerAlt}
                className="text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
              />
              <InputText
                placeholder="Ex: Cocody, Abidjan"
                className="w-full pl-10 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-oskar-green focus:border-transparent"
                value={adData.location}
                onChange={(e) =>
                  setAdData({ ...adData, location: e.target.value })
                }
                required
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Description et photos
      </h3>

      <div className="space-y-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description détaillée *
          </label>
          <span className="p-input-icon-left w-full">
            <FontAwesomeIcon
              icon={faAlignLeft}
              className="text-gray-400 absolute left-3 top-3"
            />
            <InputTextarea
              placeholder="Décrivez votre article en détail (état, raisons de la vente, accessoires inclus, etc.)"
              className="w-full pl-10 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-oskar-green focus:border-transparent"
              rows={5}
              value={adData.description}
              onChange={(e) =>
                setAdData({ ...adData, description: e.target.value })
              }
              required
            />
          </span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Photos (jusqu'à 10 images)
          </label>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <i className="fa-solid fa-times text-xs"></i>
                </button>
              </div>
            ))}

            {imagePreviews.length < 10 && (
              <label className="cursor-pointer">
                <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-green-500 transition-colors">
                  <FontAwesomeIcon
                    icon={faImage}
                    className="text-gray-400 text-xl mb-2"
                  />
                  <span className="text-sm text-gray-600">
                    Ajouter une photo
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>

          <p className="text-xs text-gray-500">
            Les premières photos sont les plus importantes. Utilisez des photos
            de bonne qualité.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Récapitulatif
      </h3>

      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Titre :</span>
          <span className="font-medium">{adData.title || "Non renseigné"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Catégorie :</span>
          <span className="font-medium">
            {categories.find((c) => c.value === adData.category)?.label ||
              "Non renseigné"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Prix :</span>
          <span className="font-medium">
            {adData.price
              ? `${adData.price.toLocaleString()} FCFA`
              : "Non renseigné"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Localisation :</span>
          <span className="font-medium">
            {adData.location || "Non renseigné"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Photos :</span>
          <span className="font-medium">{adData.images.length} image(s)</span>
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h4 className="font-medium text-blue-800 mb-2">
          <i className="fa-solid fa-lightbulb mr-2"></i>
          Conseils pour une bonne annonce
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Soyez précis dans votre description</li>
          <li>• Utilisez des photos de bonne qualité</li>
          <li>• Fixez un prix raisonnable</li>
          <li>• Répondez rapidement aux messages</li>
        </ul>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <Dialog
      header={
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800">
            Publier une annonce
          </h2>
          <div className="flex justify-center mt-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === stepNum
                      ? "bg-oskar-green text-white"
                      : step > stepNum
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > stepNum ? (
                    <i className="fa-solid fa-check text-xs"></i>
                  ) : (
                    stepNum
                  )}
                </div>
                {stepNum < 3 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      step > stepNum ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      }
      visible={visible}
      style={{ width: "90vw", maxWidth: "600px" }}
      onHide={onHide}
      className="rounded-xl shadow-2xl border border-gray-100"
      closeOnEscape={!loading}
      closable={!loading}
    >
      <form onSubmit={handleSubmit} className="px-2 py-4">
        {renderCurrentStep()}

        <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
          {step > 1 ? (
            <Button
              type="button"
              label="Retour"
              icon="fa-solid fa-arrow-left"
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              onClick={prevStep}
              disabled={loading}
            />
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <Button
              type="button"
              label="Suivant"
              icon="fa-solid fa-arrow-right"
              iconPos="right"
              className="px-4 py-2 text-white font-semibold rounded-lg"
              style={{ backgroundColor: colors.oskar.green }}
              onClick={nextStep}
              disabled={loading}
            />
          ) : (
            <Button
              type="submit"
              label={loading ? "Publication en cours..." : "Publier l'annonce"}
              icon="fa-solid fa-paper-plane"
              className="px-4 py-2 text-white font-semibold rounded-lg"
              style={{ backgroundColor: colors.oskar.green }}
              loading={loading}
              disabled={loading}
            />
          )}
        </div>

        {!isLoggedIn && step === 1 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <i className="fa-solid fa-exclamation-triangle mr-2"></i>
              Vous devez être connecté pour publier une annonce.
              <button
                type="button"
                className="ml-1 text-oskar-green hover:underline font-medium"
                onClick={onLoginRequired}
              >
                Se connecter
              </button>
            </p>
          </div>
        )}
      </form>
    </Dialog>
  );
};

export default PublishAdModal;

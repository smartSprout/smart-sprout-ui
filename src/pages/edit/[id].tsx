import { FormikErrors, useFormik } from "formik";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { Layout } from "src/components/Layout";
import {
  EditPlantInput,
  FindAllPlantsDocument,
  PlantInput,
  PlantTypes,
  SvgUsed,
  useEditPlantMutation,
  useFindPlantByIdQuery,
} from "src/generated/graphql";

const EditPlant: NextPage = () => {
  const router = useRouter();
  let id: string = router.query.id as string;

  const { data: plant, error } = useFindPlantByIdQuery({
    variables: { findPlantByIdId: id },
  });

  const [editPlant] = useEditPlantMutation();

  if (!plant || error) {
    return (
      <div>
        <Layout btn="back">
          <div className="item-page font-green">This item doesn't exist.</div>
        </Layout>
      </div>
    );
  }

  const editPlantForm = useFormik({
    initialValues: {
      _id: plant?.findPlantById._id,
      type: plant?.findPlantById.type as PlantTypes,
      name: plant?.findPlantById.name,
      img: plant?.findPlantById.img as SvgUsed,
    },
    validate: (values: EditPlantInput) => {
      const errors: FormikErrors<EditPlantInput> = {};

      if (!values.type) {
        errors.type = "Select a plant type.";
      }

      if (!values.name) {
        errors.name = "Name of the plan is required.";
      }

      if (!values.img) {
        errors.img = "Select a representative image for the plant.";
      }

      return errors;
    },
    onSubmit: async (values: PlantInput) => {
      await editPlant({
        variables: { input: { _id: id, ...values } },
        refetchQueries: [{ query: FindAllPlantsDocument }],
      })
        .catch((error) => {
          console.log(error);
        })
        .then((responce) => {
          if (responce?.data?.editPlant) {
            router.push("/");
          }
        });
      editPlantForm.resetForm();
    },
  });

  const formikPlantTouched: any = editPlantForm.touched;
  const formikPlantErrors: any = editPlantForm.errors;

  const isPlantFormFieldValid = (name: string) =>
    !!(formikPlantTouched[name] && formikPlantErrors[name]);
  const getPlantFormErrorMessage = (name: string) => {
    return (
      isPlantFormFieldValid(name) && (
        <small className="red-err">{formikPlantErrors[name]}</small>
      )
    );
  };

  return (
    <>
      <Head>
        <title>Add New Plant</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout btn="back">
        <div className="home-page">
          <form onSubmit={editPlantForm.handleSubmit} className="plant-form">
            <div className="plant-field">
              <label htmlFor="type">Type</label>
              <select
                id="type"
                name="type"
                onChange={editPlantForm.handleChange}
                value={editPlantForm.values.type || ""}
              >
                <option value="">- - -</option>
                {Object.keys(PlantTypes).map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              {getPlantFormErrorMessage("type")}
            </div>
            <div className="plant-field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                onChange={editPlantForm.handleChange}
                value={editPlantForm.values.name || ""}
              />
              {getPlantFormErrorMessage("name")}
            </div>
            <div className="plant-field">
              <label htmlFor="img">Representative image</label>
              <select
                id="img"
                name="img"
                onChange={editPlantForm.handleChange}
                value={editPlantForm.values.img || ""}
              >
                <option value="">- - -</option>
                {Object.keys(SvgUsed).map((i) => (
                  <option key={i} value={i.toLowerCase()}>
                    {i}
                  </option>
                ))}
              </select>
              {getPlantFormErrorMessage("img")}
            </div>
            <button type="submit">Update</button>
          </form>
        </div>
      </Layout>
    </>
  );
};

export default EditPlant;